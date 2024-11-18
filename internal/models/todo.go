package models

import "time"

type Todo struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateTodoRequest struct {
	Body      string `json:"body"`
	Completed bool `json:"completed"`
}

type UpdateTodoRequest struct {
    Completed bool `json:"completed"`
}