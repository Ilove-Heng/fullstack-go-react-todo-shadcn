package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/Ilove-Heng/fullstack-go-react-todo-shadcn/internal/handler"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	    // Load .env if not in production
		if os.Getenv("ENV") != "production" {
			if err := godotenv.Load(); err != nil {
				log.Fatal("Error loading .env file:", err)
			}
		}

		// Connect to postgres
		dbURL := os.Getenv("DATABASE_URL")
		if dbURL == "" {
			log.Fatal("DATABASE_URL environment variable is not set")
		}

		var err error
		db, err = sql.Open("postgres", dbURL);

		if err != nil {
			log.Fatal("Error connecting to the database:", err)
		}

		defer db.Close()
	
		if err := db.Ping(); err != nil {
			log.Fatal("Error pinging database:", err)
		}

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