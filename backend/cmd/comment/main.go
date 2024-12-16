package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Comment представляет комментарий
type Comment struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	Description string    `json:"description"`
	AuthorID    int       `json:"author_id"`
	VotingID    int       `json:"voting_id"`
}

// JWTClaims представляет данные, содержащиеся в JWT токене
type JWTClaims struct {
	Username string `json:"username"`
	ID       int    `json:"id"` // Добавляем ID пользователя
	jwt.StandardClaims
}

var db *gorm.DB

// Инициализация базы данных
func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=postgres dbname=votings port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}
	db.AutoMigrate(&Comment{}) // Автоматическая миграция модели Comment
}

// Функция для добавления комментария
func addComment(c echo.Context) error {
	var comment Comment
	if err := c.Bind(&comment); err != nil {
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
	comment.AuthorID = claims.ID
	comment.VotingID, _ = strconv.Atoi(c.Param("votingId"))

	// Сохраняем комментарий в базе данных
	if err := db.Create(&comment).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении комментария")
	}

	return c.JSON(http.StatusCreated, comment)
}

// Функция для получения комментариев
func getComments(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("votingId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}

	var comments []Comment
	if err := db.Where("voting_id = ?", votingID).Find(&comments).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении комментариев")
	}

	return c.JSON(http.StatusOK, comments)
}

// Функция для удаления комментария
func deleteComment(c echo.Context) error {
	commentID, err := strconv.Atoi(c.Param("commentId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID комментария")
	}

	// Получаем ID пользователя из токена
	token := c.Request().Header.Get("Authorization")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Отсутствует токен")
	}

	// Удаляем "Bearer " из токена
	token = token[len("Bearer "):]

	claims := &JWTClaims{}
	_, err = jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("your_secret_key"), nil // Замените на ваш секретный ключ
	})

	if err != nil {
		return c.JSON(http.StatusUnauthorized, "Неверный токен")
	}

	// Удаляем комментарий по ID
	if err := db.Where("id = ? AND author_id = ?", commentID, claims.ID).Delete(&Comment{}).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при удалении комментария")
	}

	return c.JSON(http.StatusOK, "Комментарий успешно удален")
}

// Функция main
func main() {
	initDB() // Инициализация базы данных
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"*"}, // Разрешаем все источники
		AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderAuthorization},
	}))
	e.POST("/votings/:votingId/comments", addComment)
	e.GET("/votings/:votingId/comments", getComments)
	e.DELETE("/votings/comments/:commentId", deleteComment) // Добавляем маршрут для удаления комментария
	e.Start(":8085")
}
