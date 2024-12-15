package main

import (
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt" // Импортируем пакет bcrypt
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

// User структура для модели пользователя
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

// JWTClaims структура для хранения данных JWT
type JWTClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// Инициализация базы данных
func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=postgres dbname=votings port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	db.AutoMigrate(&User{}) // Автоматическая миграция модели User
}

// Функция для хэширования пароля
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// Функция для проверки пароля
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func registerUser(c echo.Context) error {
	var user User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	// Преобразование строки даты в time.Time
	dob, err := time.Parse("2006-01-02", user.DateOfBirth)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Неверный формат даты рождения")
	}
	user.DateOfBirth = dob.Format("2006-01-02") // Сохраняем в формате time.Time

	// Хеширование пароля
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при хэшировании пароля")
	}
	user.Password = hashedPassword // Сохраняем хэшированный пароль

	if err := db.Create(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при сохранении пользователя")
	}
	return c.JSON(http.StatusCreated, "Успешно зарегистрирован пользователь "+user.Username)
}

// Аутентификация пользователя
func loginUser(c echo.Context) error {
	var user User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	var dbUser User
	if err := db.Where("username = ?", user.Username).First(&dbUser).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, "Неверные учетные данные")
	}

	// Проверка пароля
	if !checkPasswordHash(user.Password, dbUser.Password) {
		return c.JSON(http.StatusUnauthorized, "Неверные учетные данные")
	}

	// Создание JWT токена
	claims := &JWTClaims{
		Username: dbUser.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 72).Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("your_secret_key")) // Замените на свой секретный ключ
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Ошибка при создании токена")
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": tokenString,
	})
}

// Получение информации о пользователе
func getUser(c echo.Context) error {
	username := c.Param("username")
	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, "Пользователь не найден")
	}
	return c.JSON(http.StatusOK, user)
}

func main() {
	initDB() // Инициализация базы данных

	e := echo.New()
	e.POST("/users/register", registerUser)
	e.POST("/users/login", loginUser)
	e.GET("/users/:username", getUser)

	e.Logger.Fatal(e.Start(":8080")) // Запуск сервера
}
