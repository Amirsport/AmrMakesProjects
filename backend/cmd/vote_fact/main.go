package main

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// VoteFact представляет голосование
type VoteFact struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	AuthorID  int       `json:"author_id"` // ID пользователя, который проголосовал
	CreatedAt time.Time `json:"created_at"`
	VariantID int       `json:"variant_id"` // ID варианта голосования
}

// JWTClaims представляет данные, содержащиеся в JWT токене
type JWTClaims struct {
	Username string `json:"username"`
	ID       int    `json:"id"` // Добавляем ID пользователя
	jwt.StandardClaims
}

type VoteVariant struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Description string `json:"description"`
	VotingID    int    `json:"voting_id"`
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
	db.AutoMigrate(&VoteFact{}) // Автоматическая миграция модели VoteFact
}

// Функция для добавления голоса
func addVote(c echo.Context) error {
	var vote VoteFact
	if err := c.Bind(&vote); err != nil {
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

	// Устанавливаем ID автора
	vote.AuthorID = claims.ID

	// Проверяем, существует ли уже голос пользователя для данного варианта
	var existingVote VoteFact
	if err := db.Where("author_id = ? AND variant_id = ?", vote.AuthorID, vote.VariantID).First(&existingVote).Error; err == nil {
		// Если голос уже существует, обновляем его
		existingVote.VariantID = vote.VariantID
		if err := db.Save(&existingVote).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, "Ошибка при обновлении голоса")
		}
		return c.JSON(http.StatusOK, existingVote)
	}

	// Сохраняем новый голос в базе данных
	if err := db.Create(&vote).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении голоса")
	}

	return c.JSON(http.StatusCreated, vote)
}

// Функция для получения голосов для голосования
func getVotes(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("votingId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}

	// Получаем все варианты для данного голосования
	var variants []VoteVariant
	if err := db.Where("voting_id = ?", votingID).Find(&variants).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении вариантов голосования")
	}

	// Получаем все голоса для этих вариантов
	var votes []VoteFact
	if err := db.Where("variant_id IN ?", getVariantIDs(variants)).Find(&votes).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосов")
	}

	return c.JSON(http.StatusOK, votes)
}

// Вспомогательная функция для получения ID вариантов
func getVariantIDs(variants []VoteVariant) []int {
	var ids []int
	for _, variant := range variants {
		ids = append(ids, variant.ID)
	}
	return ids
}

func revokeVote(c echo.Context) error {
	voteID, err := strconv.Atoi(c.Param("voteId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голоса")
	}

	// Log the vote ID being revoked
	log.Printf("Attempting to revoke vote with ID: %d", voteID)

	// Получаем ID пользователя из токена
	token := c.Request().Header.Get("Authorization")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Отсутствует токен")
	}

	// Удаляем "Bearer " из токена
	token = token[len("Bearer "):]

	claims := &JWTClaims{}
	_, err = jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("your_secret_key"), nil
	})

	if err != nil {
		return c.JSON(http.StatusUnauthorized, "Неверный токен")
	}

	// Проверяем, существует ли голос
	var vote VoteFact
	if err := db.Where("id = ? AND author_id = ?", voteID, claims.ID).First(&vote).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, "Голос не найден")
		}
		return c.JSON(http.StatusInternalServerError, "Ошибка при проверке голоса")
	}

	// Удаляем голос по ID
	if err := db.Delete(&vote).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при отзыве голоса")
	}

	return c.JSON(http.StatusOK, "Голос успешно отозван")
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
	e.POST("/votings/:votingId/votes", addVote)
	e.GET("/votings/:votingId/votes", getVotes)    // Получение голосов для голосования
	e.DELETE("/votings/votes/:voteId", revokeVote) // Добавляем маршрут для отзыва голоса
	e.Start(":8084")
}
