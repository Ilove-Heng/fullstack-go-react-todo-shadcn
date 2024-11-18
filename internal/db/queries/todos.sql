-- name: GetTodos :many
SELECT * FROM todos
ORDER BY created_at DESC;

-- name: GetTodoByID :one
SELECT * FROM todos
WHERE id = $1;

-- name: CreateTodo :one
INSERT INTO todos (
    body,
    completed
) VALUES (
    $1, $2
) RETURNING *;

-- name: UpdateTodoCompletion :one
UPDATE todos
SET completed = true
WHERE id = $1
RETURNING *;

-- name: DeleteTodo :exec
DELETE FROM todos
WHERE id = $1;