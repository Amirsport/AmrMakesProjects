package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Comment struct {
	ID       int    `json:"id"`
	VotingID int    `json:"voting_id"`
	UserID   int    `json:"user_id"`
	Content  string `json:"content"`
}

var comments []Comment

func addComment(c echo.Context) error {
	var comment Comment
	if err := c.Bind(&comment); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	comments = append(comments, comment)
	return c.JSON(http.StatusCreated, comment)
}

func getComments(c echo.Context) error {
	// Логика получения комментариев для голосования по votingID
	return c.JSON(http.StatusOK, comments)
}

func main() {
	e := echo.New()
	e.POST("/votings/:votingId/comments", addComment)
	e.GET("/votings/:votingId/comments", getComments)
	e.Start(":8084")
}
