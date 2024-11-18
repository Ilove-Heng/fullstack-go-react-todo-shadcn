package handler

import (
	"database/sql"

	"github.com/Ilove-Heng/fullstack-go-react-todo-shadcn/internal/db/sqlc"
	"github.com/Ilove-Heng/fullstack-go-react-todo-shadcn/internal/models"
	"github.com/gofiber/fiber/v2"
)

type TodoHandler struct {
    queries *sqlc.Queries
}

func NewTodoHandler(db *sql.DB) *TodoHandler {
	return &TodoHandler{
		queries: sqlc.New(db),
	}
}

func (h *TodoHandler) GetTodos(c *fiber.Ctx) error {
    todos, err := h.queries.GetTodos(c.Context())
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to fetch todos",
            "details": err.Error(),
        })
    }
    return c.JSON(todos)
}

func (h *TodoHandler) CreateTodo(c *fiber.Ctx) error {
    var req models.CreateTodoRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid request body",
            "details": err.Error(),
        })
    }

    if req.Body == "" {
        return c.Status(400).JSON(fiber.Map{
            "error": "Body is required",
        })
    }

    todo, err := h.queries.CreateTodo(c.Context(), sqlc.CreateTodoParams{
        Body:      req.Body,
        Completed: req.Completed,
    })
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to create todo",
            "details": err.Error(),
        })
    }

    return c.Status(201).JSON(todo)
}

func (h *TodoHandler) UpdateTodo(c *fiber.Ctx) error {
    id, err := c.ParamsInt("id")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid ID format",
            "details": err.Error(),
        })
    }

    todo, err := h.queries.UpdateTodoCompletion(c.Context(), int32(id))
    if err != nil {
        if err == sql.ErrNoRows {
            return c.Status(404).JSON(fiber.Map{
                "error": "Todo not found",
            })
        }
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to update todo",
            "details": err.Error(),
        })
    }

    return c.JSON(todo)
}

func (h *TodoHandler) DeleteTodo(c *fiber.Ctx) error {
    id, err := c.ParamsInt("id")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid ID format",
            "details": err.Error(),
        })
    }

    err = h.queries.DeleteTodo(c.Context(), int32(id))
    if err != nil {
        if err == sql.ErrNoRows {
            return c.Status(404).JSON(fiber.Map{
                "error": "Todo not found",
            })
        }
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to delete todo",
            "details": err.Error(),
        })
    }

    return c.Status(200).JSON(fiber.Map{
        "message": "Todo deleted successfully",
    })
}