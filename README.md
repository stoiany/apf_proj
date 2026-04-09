## Лабораторна робота №3

Цей проєкт є розширенням бекенду для системи управління графіками чергувань (Shifts & Swap Requests). Дані тепер зберігаються локально в реляційній базі даних SQLite.
Запуск та ініціалізація бази даних

Встановіть залежності:

```bash
npm install
```

Запустіть застосунок:

```bash
npm run dev
```

При першому запуску сервер автоматично виконає всі міграції (папка migrations/) та створить файл бази даних за шляхом ./data/app.db. Цей файл додано у .gitignore.

(Опційно) Наповнення бази тестовими даними (Seed):
```bash
npm run seed
```

### Схема Бази Даних

Схема складається з 3-х основних таблиць та таблиці міграцій:
```
Users
    id (TEXT PRIMARY KEY)
    username (TEXT NOT NULL UNIQUE)
```

```
Shifts (Графік чергувань)
    id (TEXT PRIMARY KEY)
    userId (TEXT NOT NULL, FOREIGN KEY -> Users.id ON DELETE CASCADE)
    date (TEXT NOT NULL)
    time (TEXT NOT NULL, CHECK: 'morning', 'day', 'evening')
    status (TEXT NOT NULL, CHECK: 'scheduled', 'completed', 'missed', 'canceled')
    comment (TEXT)
    createdAt (TEXT NOT NULL)
```

```
SwapRequests (Запити на обмін змінами)
    id (TEXT PRIMARY KEY)
    requesterId (TEXT NOT NULL, FOREIGN KEY -> Users.id ON DELETE CASCADE)
    targetUserId (TEXT NOT NULL, FOREIGN KEY -> Users.id ON DELETE CASCADE)
    shiftId (TEXT NOT NULL, FOREIGN KEY -> Shifts.id ON DELETE CASCADE)
    status (TEXT NOT NULL, CHECK: 'pending', 'approved', 'rejected')
    createdAt (TEXT NOT NULL)
```

#### Індекси: Створені індекси для швидкого пошуку (idx_shifts_date, idx_shifts_userId, idx_swap_shiftId).

### Приклади запитів (API Endpoints)

#### 1. Отримання списку змін (з фільтрацією та сортуванням):

GET /api/shifts?status=scheduled&sortBy=date&sortDir=desc

Цей запит використовує WHERE (для status) та ORDER BY (для sortBy та sortDir).

#### 2. Отримання запитів на обмін (демонстрація JOIN):

GET /api/swapRequests?status=pending

Повертає запити на обмін, приєднуючи імена користувачів (requester та targetUser) через подвійний JOIN таблиці Users.

#### 3. Аналітика (Агрегація COUNT / GROUP BY):

GET /api/shifts/stats

Повертає кількість змін, згрупованих за їх статусом.

### Демонстрація SQL Injection (SQLi)

На даному етапі розробки (згідно з умовами лабораторної роботи) SQL-запити формуються за допомогою рядкової конкатенації, без використання параметризованих запитів.

Чому це небезпечно?
Якщо користувач передасть у параметр id або username специфічний рядок, наприклад:

`' OR 1=1 --`

Це може зламати логіку запиту. Наприклад, запит 
```sql 
SELECT * FROM Users WHERE username = '${username}' 
``` 
перетвориться на:
```sql
SELECT * FROM Users WHERE username = '' OR 1=1 --'
```

Умова 1=1 завжди істинна, а -- коментує залишок запиту. Це дозволить зловмиснику обійти авторизацію або отримати доступ до всіх записів у базі. Наразі в проєкті імплементовано базовий захист через .replace(/'/g, "''"), але фундаментально архітектура з конкатенацією залишається вразливою до більш складних атак. Ця проблема буде вирішена в наступних лабораторних роботах.