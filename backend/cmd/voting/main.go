package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Voting struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Description string `json:"description"`
	AuthorID    int    `json:"author_id"`   // Поле для ID автора
	VotingType  int    `json:"voting_type"` // Изменено на int для соответствия INTEGER
	Image       string `json:"image"`       // Хранит путь к изображению
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

// Функция для создания голосования
func createVoting(c echo.Context) error {
	name := c.FormValue("name")
	description := c.FormValue("description")
	authorID := c.FormValue("author_id")
	votingType := c.FormValue("voting_type")

	// Преобразование authorID и votingType в int
	authorIDInt, err := strconv.Atoi(authorID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Ошибка: неверный author_id")
	}

	votingTypeInt, err := strconv.Atoi(votingType)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Ошибка: неверный voting_type")
	}

	// Создание структуры Voting
	voting := Voting{
		Name:        name,
		Description: description,
		AuthorID:    authorIDInt,
		VotingType:  votingTypeInt,
	}
	if err := c.Bind(&voting); err != nil {
		log.Printf("Ошибка при привязке данных: %v", err)
		return c.JSON(http.StatusBadRequest, err)
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
	if err := db.Find(&votings).Error; err != nil {
		log.Printf("Ошибка при получении голосований: %v", err)
		return c.JSON(http.StatusInternalServerError, "Ошибка при получении голосований")
	}

	log.Printf("Получено голосований: %d", len(votings))
	return c.JSON(http.StatusOK, votings)
}

func main() {
	initDB()
	e := echo.New()

	e.POST("/votings", createVoting)
	e.GET("/votings", getVotings)

	e.Logger.Fatal(e.Start(":8081"))
}
