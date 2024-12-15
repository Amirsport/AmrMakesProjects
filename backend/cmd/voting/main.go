package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

type Voting struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	AuthorID    int    `json:"author_id"`
}

var votings []Voting

func createVoting(c echo.Context) error {
	var voting Voting
	if err := c.Bind(&voting); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	votings = append(votings, voting)
	return c.JSON(http.StatusCreated, voting)
}

func getVotings(c echo.Context) error {
	return c.JSON(http.StatusOK, votings)
}

func main() {
	e := echo.New()
	e.POST("/votings", createVoting)
	e.GET("/votings ", getVotings)
	e.Start(":8081")
}
