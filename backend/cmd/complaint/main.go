package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Complaint представляет жалобу
type Complaint struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	Description string    `json:"description"`
	AuthorID    int       `json:"author_id"`
	VotingID    int       `json:"voting_id"`
	Status      string    `json:"status"` // Статус жалобы
	CreatedAt   time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
}

// User представляет пользователя
type User struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Username    string `json:"username"`
	IsSuperuser bool   `json:"is_superuser"`
}

// JWTClaims представляет данные, содержащиеся в JWT токене
type JWTClaims struct {
	Username    string `json:"username"`
	ID          int    `json:"id"`           // Добавляем ID пользователя
	IsSuperuser bool   `json:"is_superuser"` // Добавляем поле для проверки прав администратора
	jwt.StandardClaims
}

var db *gorm.DB

// Инициализация базы данных
func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=Amirka58906510 dbname=pokedex port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}
	db.AutoMigrate(&Complaint{}, &User{}) // Автоматическая миграция моделей Complaint и User
}

// Функция для добавления жалобы
func addComplaint(c echo.Context) error {
	var complaint Complaint
	if err := c.Bind(&complaint); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	// Получаем ID пользователя из токена
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

	// Устанавливаем ID автора и ID голосования
	complaint.AuthorID = claims.ID
	complaint.VotingID, _ = strconv.Atoi(c.Param("votingId"))
	complaint.Status = "pending" // Устанавливаем статус по умолчанию

	// Сохраняем жалобу в базе данных
	if err := db.Create(&complaint).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении жалобы")
	}

	return c.JSON(http.StatusCreated, complaint)
}

// Функция для получения жалоб
func getComplaints(c echo.Context) error {
	// Проверяем, является ли пользователь администратором
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

	// Получаем конкретного пользователя по ID
	var user User
	if err := db.First(&user, claims.ID).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении пользователя")
	}

	// Выводим ID пользователя
	fmt.Printf("User  ID: %d, Is Superuser: %t\n", user.ID, user.IsSuperuser)

	if !user.IsSuperuser {
		return c.JSON(http.StatusForbidden, "Доступ запрещен")
	}

	var complaints []Complaint
	if err := db.Find(&complaints).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении жалоб")
	}

	return c.JSON(http.StatusOK, complaints)
}

func main() {
	initDB() // Инициализация базы данных
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"*"}, // Разрешаем все источники
		AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderAuthorization},
	}))
	e.POST("/votings/:votingId/complaints", addComplaint)
	e.GET("/complaints", getComplaints) // Добавляем маршрут для получения жалоб
	e.Start(":8086")
}
