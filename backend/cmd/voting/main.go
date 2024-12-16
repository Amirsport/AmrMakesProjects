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
	AuthorID    uint   `json:"author_id"`                         // Поле для ID автора
	VotingType  int    `json:"voting_type"`                       // Изменено на int для соответствия INTEGER
	Image       string `json:"image"`                             // Хранит путь к изображению
	Author      User   `json:"author" gorm:"foreignKey:AuthorID"` // Добавьте это поле для связи с пользователем
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
		return c.JSON(http.StatusBadRequest, "Ошибка: неверный voting_type")
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

// Функция для получения всех голосований
func getVotings(c echo.Context) error {
	var votings []Voting
	if err := db.Preload("Author").Find(&votings).Error; err != nil {
		log.Printf("Ошибка при получении голосований: %v", err)
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосований")
	}

	log.Printf("Получено голосований: %d", len(votings))
	return c.JSON(http.StatusOK, votings)
}

func main() {
	initDB()
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"*"}, // Разрешаем все источники
		AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderAuthorization},
	}))

	// Обслуживание статических файлов из директории media
	e.Static("/media", "media")

	e.POST("/votings", JWTMiddleware(createVoting)) // Применяем middleware
	e.GET("/votings", getVotings)

	e.Logger.Fatal(e.Start(":8081"))
}
