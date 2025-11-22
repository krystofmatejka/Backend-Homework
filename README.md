# Shopping List

## Routes

| Name | API Path | HTTP Method | Authorized |
|------|----------|-------------|------------|
| Get shopping list | /api/v1/lists/:listId | GET | True/False (depends on configuration) |
| Get shopping lists | /api/v1/lists | GET | True (only for owners and members) |
| Create shopping list | /api/v1/lists | POST | True (only for registered) |
| Edit shopping list (rename, make public, add/remove member) | /api/v1/lists/:listId | PATCH | True (only for owners) |
| Leave shopping list | /api/v1/lists/:listId/leave | PATCH | True (only for members) |
| Archive shopping list | /api/v1/lists/:listId/archive | PATCH | True (only for owner) |
| Remove shopping list | /api/v1/lists/:listId/remove | DELETE | True (only for owner) |
| Get user | /api/v1/users/:userId | GET | True (only for registered) |
| Get users | /api/v1/users | GET | True (only for registered) |
| Create user | /api/v1/users | POST | False |
| Add item | /api/v1/lists/:listId/item | POST | True (only for list owner or members) |
| Edit item (rename, mark as purchased) | /api/v1/lists/:listId/item/:itemId | PATCH | True (only for list owner or members) |
| Remove item | /api/v1/lists/:listId/item/remove/:itemId | POST | True (only for list owner or members) |