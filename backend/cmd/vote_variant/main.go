package main

import (
	"net/http"
	"strconv"

	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" // Импортируем middleware для CORS
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// VoteVariant представляет вариант голосования
type VoteVariant struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Description string `json:"description"` // Поле для описания варианта
	VotingID    int    `json:"voting_id"`   // ID голосования
}

// Voting представляет голосование
type Voting struct {
	ID       int `json:"id" gorm:"primaryKey"`
	AuthorID int `json:"author_id"` // ID автора
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

// Функция для добавления варианта голосования
func addVoteVariant(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("votingId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}

	var variant VoteVariant
	if err := c.Bind(&variant); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	variant.VotingID = votingID // Устанавливаем ID голосования

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

	// Получаем ID автора голосования
	var voting Voting
	if err := db.First(&voting, votingID).Error; err != nil {
		return c.JSON(http.StatusNotFound, "Голосование не найдено")
	}

	// Выводим в консоль ID пользователя и ID автора
	userID := claims.ID
	authorID := voting.AuthorID
	fmt.Printf("User   ID: %d, Author ID: %d\n", userID, authorID)

	// Проверка, что пользователь является создателем голосования
	if userID != authorID {
		return c.JSON(http.StatusForbidden, "Только создатель голосования может добавлять варианты")
	}

	// Сохраняем новый вариант в базе данных
	if err := db.Create(&variant).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении варианта голосования")
	}

	return c.JSON(http.StatusCreated, variant)
}

// Функция для редактирования варианта голосования
func editVoteVariant(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("votingId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}
	variantID, err := strconv.Atoi(c.Param("variantId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID варианта")
	}

	var updatedVariant VoteVariant
	if err := c.Bind(&updatedVariant); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	// Проверка, что пользователь является создателем голосования
	if !isCreator(c, votingID) {
		return c.JSON(http.StatusForbidden, "Только создатель голосования может редактировать варианты")
	}

	// Находим вариант в базе данных
	var variant VoteVariant
	if err := db.First(&variant, variantID).Error; err != nil {
		return c.JSON(http.StatusNotFound, "Вариант не найден")
	}

	// Проверяем, что вариант принадлежит данному голосованию
	if variant.VotingID != votingID {
		return c.JSON(http.StatusBadRequest, "Вариант не принадлежит данному голосованию")
	}

	// Обновляем описание варианта
	variant.Description = updatedVariant.Description

	// Сохраняем изменения в базе данных
	if err := db.Save(&variant).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при обновлении варианта голосования")
	}

	return c.JSON(http.StatusOK, variant)
}

// Функция для удаления варианта голосования
func deleteVoteVariant(c echo.Context) error {
	votingID, err := strconv.Atoi(c.Param("votingId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID голосования")
	}
	variantID, err := strconv.Atoi(c.Param("variantId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный ID варианта")
	}

	// Проверка, что пользователь является создателем голосования
	if !isCreator(c, votingID) {
		return c.JSON(http.StatusForbidden, "Только создатель голосования может удалять варианты")
	}

	// Находим вариант в базе данных
	var variant VoteVariant
	if err := db.First(&variant, variantID).Error; err != nil {
		return c.JSON(http.StatusNotFound, "Вариант не найден")
	}

	// Проверяем, что вариант принадлежит данному голосованию
	if variant.VotingID != votingID {
		return c.JSON(http.StatusBadRequest, "Вариант не принадлежит данному голосованию")
	}

	// Удаляем вариант из базы данных
	if err := db.Delete(&variant).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при удалении варианта голосования")
	}

	return c.JSON(http.StatusNoContent, nil)
}

// Функция для проверки, является ли пользователь создателем голосования
func isCreator(c echo.Context, votingID int) bool {
	// Извлечение токена из заголовка
	token := c.Request().Header.Get("Authorization")
	if token == "" {
		return false
	}

	// Удаляем "Bearer " из токена
	token = token[len("Bearer "):]

	claims := &JWTClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("your_secret_key"), nil // Замените на ваш секретный ключ
	})

	if err != nil {
		return false
	}

	// Получаем author_id из базы данных
	var voting Voting
	if err := db.First(&voting, votingID).Error; err != nil {
		return false
	}

	// Выводим в консоль ID пользователя и ID автора
	fmt.Printf("User  ID: %d, Author ID: %d\n", claims.ID, voting.AuthorID)

	// Сравниваем author_id с ID пользователя из токена
	return voting.AuthorID == claims.ID
}

// Инициализация базы данных и запуск сервера
func main() {
	initDB() // Инициализация базы данных

	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{"*"}, // Разрешаем все источники
		AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:  []string{echo.HeaderContentType, echo.HeaderAuthorization},
		ExposeHeaders: []string{echo.HeaderAuthorization},
	}))
	e.POST("/votings/:votingId/variants", JWTMiddleware(addVoteVariant))
	e.PUT("/votings/:votingId/variants/:variantId", JWTMiddleware(editVoteVariant))
	e.DELETE("/votings/:votingId/variants/:variantId", JWTMiddleware(deleteVoteVariant))

	e.Logger.Fatal(e.Start(":8083"))
}
