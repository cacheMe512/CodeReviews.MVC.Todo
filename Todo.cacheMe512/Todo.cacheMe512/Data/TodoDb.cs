using Microsoft.EntityFrameworkCore;


namespace Todo.cacheMe512.Data;

public class TodoDb : DbContext
{
    public TodoDb(DbContextOptions<TodoDb> options)
        : base(options) { }

    public DbSet<Models.Todo> Todos => Set<Models.Todo>();
}
