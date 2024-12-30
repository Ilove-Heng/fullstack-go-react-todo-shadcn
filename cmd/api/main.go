package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/Ilove-Heng/fullstack-go-react-todo-shadcn/internal/handler"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/lib/pq"
)

func main() {
		db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
		if err != nil {
			log.Fatalf("Error opening database: %v", err)
		}
		defer db.Close()

		err = db.Ping()
		if err != nil {
			log.Fatalf("Error connecting to the database: %v", err)
		}

		log.Println("Connected to the database successfully!")

		log.Println("Conntected to postgres...")

		todoHandler := handler.NewTodoHandler(db) 

		// Create fiber app
		app := fiber.New(fiber.Config{
			Prefork: true,
			ServerHeader: "fullstack-go-react-todo-shadcn",
		})

		// Add CORS middleware
		app.Use(cors.New(cors.Config{
			AllowOrigins:  "*",
			AllowHeaders:  "Origin, Content-Type, Accept",
			AllowMethods:  "GET, POST, PATCH, DELETE",
			ExposeHeaders: "Content-Length, Access-Control-Allow-Origin",
		}))

		// Routes
		api := app.Group("/api")
		todos := api.Group("todos")

		{
			todos.Get("/", todoHandler.GetTodos)
			todos.Post("/", todoHandler.CreateTodo)
			todos.Patch("/:id", todoHandler.UpdateTodo)
			todos.Delete("/:id", todoHandler.DeleteTodo)
		}
		
		// Serve static files in production
		if os.Getenv("ENV") == "production" {
			app.Static("/", "./client/dist")
		}

		// Start server
		port := os.Getenv("PORT")

		if port == "" {
			port = "5000"
		}

		log.Fatal(app.Listen("0.0.0.0:" + port))

}