package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Complaint представляет жалобу
type Move struct {
	ID            int    `json:"id" gorm:"primaryKey"`
	MoveNumber    string `json:"numbermove"`
	AuthorID      int    `json:"author_id"`
	CardID        int    `json:"card_id"`
	Score         int    `json:"score"`
	RemainedCards int    `json:"remained"` // Статус жалобы
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
	db.AutoMigrate(&User{})
}

// Функция для добавления жалобы
func addComplaint(c echo.Context) error {
	var move Move
	if err := c.Bind(&move); err != nil {
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
	move.AuthorID = claims.ID
	move.CardID, _ = strconv.Atoi(c.Param("cardId"))

	// Сохраняем жалобу в базе данных
	if err := db.Create(&move).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении жалобы")
	}

	return c.JSON(http.StatusCreated, move)
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

	var move Move
	if err := db.Find(&move).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении жалоб")
	}

	return c.JSON(http.StatusOK, move)
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
