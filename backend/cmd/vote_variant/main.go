package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type VoteVariant struct {
	ID       int    `json:"id"`
	VotingID int    `json:"voting_id"`
	Name     string `json:"name"`
}

var voteVariants []VoteVariant

func addVoteVariant(c echo.Context) error {
	var variant VoteVariant
	if err := c.Bind(&variant); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	voteVariants = append(voteVariants, variant)
	return c.JSON(http.StatusCreated, variant)
}

func getVoteVariants(c echo.Context) error {
	// Логика получения вариантов для голосования по votingID
	return c.JSON(http.StatusOK, voteVariants)
}

func main() {
	e := echo.New()
	e.POST("/votings/:votingId/variants", addVoteVariant)
	e.GET("/votings/:votingId/variants", getVoteVariants)
	e.Start(":8082")
}
