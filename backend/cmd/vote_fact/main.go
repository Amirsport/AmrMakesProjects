package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

type Vote struct {
	ID       int `json:"id"`
	VotingID int `json:"voting_id"`
	UserID   int `json:"user_id"`
}

var votes []Vote

func addVote(c echo.Context) error {
	var vote Vote
	if err := c.Bind(&vote); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	votes = append(votes, vote)
	return c.JSON(http.StatusCreated, vote)
}

func getVotes(c echo.Context) error {
	// Логика получения голосов для голосования по votingID
	return c.JSON(http.StatusOK, votes)
}

func main() {
	e := echo.New()
	e.POST("/votings/:votingId/votes", addVote)
	e.GET("/votings/:votingId/votes", getVotes)
	e.Start(":8083")
}
