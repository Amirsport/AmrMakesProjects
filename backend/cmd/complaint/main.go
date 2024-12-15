package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Complaint struct {
	ID       int    `json:"id"`
	VotingID int    `json:"voting_id"`
	UserID   int    `json:"user_id"`
	Reason   string `json:"reason"`
}

var complaints []Complaint

func addComplaint(c echo.Context) error {
	var complaint Complaint
	if err := c.Bind(&complaint); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	complaints = append(complaints, complaint)
	return c.JSON(http.StatusCreated, complaint)
}

func getComplaints(c echo.Context) error {
	// Логика получения жалоб для голосования по votingID
	return c.JSON(http.StatusOK, complaints)
}

func main() {
	e := echo.New()
	e.POST("/votings/:votingId/complaints", addComplaint)
	e.GET("/votings/:votingId/complaints", getComplaints)
	e.Start(":8085")
}
