package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Password    string    `json:"password"`
	LastLogin   time.Time `json:"last_login"`
	IsSuperuser bool      `json:"is_superuser" gorm:"default:false"`
	Username    string    `json:"username" gorm:"unique"`
	Email       string    `json:"email" gorm:"unique"`
	DateJoined  time.Time `json:"date_joined" gorm:"default:CURRENT_TIMESTAMP"`
	Country     string    `json:"country"`
	Gender      int       `json:"gender"`        // 0 - женский, 1 - мужской
	DateOfBirth string    `json:"date_of_birth"` // Изменено на string
}

type Voting struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Description string `json:"description"`
	AuthorID    uint   `json:"author_id"`
	VotingType  int    `json:"voting_type"`
	Image       string `json:"image"`
	Author      User   `json:"author" gorm:"foreignKey:AuthorID"`
}

type VoteVariant struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Description string `json:"description"` // Поле для описания варианта
	VotingID    int    `json:"voting_id"`   // ID голосования
}

type JWTClaims struct {
	Username string `json:"username"`
	ID       uint   `json:"id"`
	jwt.StandardClaims
}

var db *gorm.DB

// Инициализация базы данных
func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=postgres dbname=votings port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Ошибка подключения к базе данных: %v", err)
	}
	db.AutoMigrate(&Voting{}) // Автоматическая миграция модели Voting
}

// JWT Middleware
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		token := c.Request().Header.Get("Authorization")
		if token == "" {
			return c.JSON(http.StatusUnauthorized, "Отсутствует токен")
		}

		// Удаляем "Bearer " из токена
		token = token[len("Bearer "):]

		claims := &JWTClaims{}
		_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte("your_secret_key"), nil // Замените на ваш секретный ключ
		})

		if err != nil {
			return c.JSON(http.StatusUnauthorized, "Неверный токен")
		}

		// Если токен действителен, можно продолжить
		return next(c)
	}
}

// Функция для создания голосования
func createVoting(c echo.Context) error {
	// Извлечение токена из заголовка
	token := c.Request().Header.Get("Authorization")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Отсутствует токен")
	}

	// Удаляем "Bearer " из токена
	token = token[len("Bearer "):]

	claims := &JWTClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("your_secret_key"), nil // Замените на ваш секретный ключ
	})

	if err != nil {
		return c.JSON(http.StatusUnauthorized, "Неверный токен")
	}

	// Получение данных из формы
	name := c.FormValue("name")
	description := c.FormValue("description")
	votingType := c.FormValue("voting_type")

	// Преобразование votingType в int
	votingTypeInt, err := strconv.Atoi(votingType)
	if err != nil || votingTypeInt < 1 || votingTypeInt > 3 {
		return c.JSON(http.StatusBadRequest, "Ошибка: неверный voting _type")
	}

	// Создание структуры Voting
	voting := Voting{
		Name:        name,
		Description: description,
		AuthorID:    claims.ID, // Используем ID из токена
		VotingType:  votingTypeInt,
	}

	// Получение файла изображения
	imageFile, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Ошибка: изображение не предоставлено")
	}

	// Создание директории для хранения изображений, если она не существует
	if err := os.MkdirAll("media", os.ModePerm); err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при создании директории для изображений")
	}

	// Сохранение файла изображения
	imagePath := filepath.Join("media", imageFile.Filename)
	src, err := imageFile.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при открытии файла изображения")
	}
	defer src.Close()

	dst, err := os.Create(imagePath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при создании файла изображения")
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении изображения")
	}

	// Сохранение пути к изображению в структуре Voting
	voting.Image = imagePath

	// Сохранение голосования в базе данных
	if err := db.Create(&voting).Error; err != nil {
		log.Printf("Ошибка при сохранении голосования: %v", err)
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении голосования")
	}

	log.Printf("Голосование успешно создано: %+v", voting)
	return c.JSON(http.StatusCreated, voting)
}

// Функция для получения деталей голосования с вариантами
func getVotingDetails(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}

	var voting Voting
	// Preload the Author to get author details
	if err := db.Preload("Author").First(&voting, votingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, "Голосование не найдено")
		}
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосования")
	}

	// Получаем варианты голосования
	var variants []VoteVariant
	if err := db.Where("voting_id = ?", votingID).Find(&variants).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении вариантов голосования")
	}

	// Возвращаем голосование вместе с его автором и вариантами
	return c.JSON(http.StatusOK, echo.Map{
		"voting":   voting,
		"variants": variants,
	})
}

// Функция для получения всех голосований
func getAllVotings(c echo.Context) error {
	var votings []Voting
	if err := db.Preload("Author").Find(&votings).Error; err != nil { // Предзагрузка автора
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосований")
	}

	return c.JSON(http.StatusOK, votings)
}

// Функция для обновления голосования
func updateVoting(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}

	var updatedVoting Voting
	if err := c.Bind(&updatedVoting); err != nil {
		return c.JSON(http.StatusBadRequest, "Ошибка при получении данных")
	}

	// Проверка, существует ли голосование
	var existingVoting Voting
	if err := db.First(&existingVoting, votingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, "Голосование не найдено")
		}
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосования")
	}

	// Обновление полей голосования
	existingVoting.Name = updatedVoting.Name
	existingVoting.Description = updatedVoting.Description
	existingVoting.VotingType = updatedVoting.VotingType

	// Сохранение обновленного голосования в базе данных
	if err := db.Save(&existingVoting).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при обновлении голосования")
	}

	return c.JSON(http.StatusOK, existingVoting)
}

func main() {
	initDB()
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"*"}, // Разрешаем все источники
		AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{"Authorization"},
	}))

	// Обслуживание статических файлов из директории media
	e.Static("/media", "media")

	e.POST("/votings", JWTMiddleware(createVoting)) // Применяем middleware
	e.GET("/votings/:id", getVotingDetails)
	e.PUT("/votings/:id", JWTMiddleware(updateVoting)) // Добавляем маршрут для обновления голосования
	e.GET("/votings", getAllVotings)                   // Добавляем маршрут для получения всех голосований

	e.Logger.Fatal(e.Start(":8081"))
}
