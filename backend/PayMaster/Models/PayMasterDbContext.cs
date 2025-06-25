using Microsoft.EntityFrameworkCore;

namespace PayMaster.Models
{
    public class PayMasterDbContext : DbContext
    {
        public PayMasterDbContext(DbContextOptions<PayMasterDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<LeaveRequest>().HasKey(l => l.LeaveId);
            modelBuilder.Entity<AuditLog>().HasKey(a => a.LogId);
            modelBuilder.Entity<SalaryStructure>().HasKey(s => s.SalaryId);

            // one to many: role->users
            modelBuilder.Entity<Role>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Role)
                .HasForeignKey(u => u.RoleId);

            // One-to-many: User -> AuditLogs
            modelBuilder.Entity<User>()
                .HasMany(u => u.AuditLogs)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId);

            // one to one: User -> Employee
            modelBuilder.Entity<User>()
                .HasOne(u => u.Employee)
                .WithOne(e => e.User)
                .HasForeignKey<Employee>(e => e.UserId);

            // Self-reference: Employee -> Manager
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Manager)
                .WithMany(m => m.Subordinates)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-many: Employee -> LeaveRequests
            modelBuilder.Entity<Employee>()
                .HasMany(e => e.LeaveRequests)
                .WithOne(l => l.Employee)
                .HasForeignKey(l => l.EmployeeId);

            // One-to-many: User (Approver) -> LeaveRequests
            modelBuilder.Entity<User>()
                .HasMany(u => u.ApprovedLeaveRequests)
                .WithOne(l => l.Approver)
                .HasForeignKey(l => l.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-many: Employee -> SalaryStructures
            modelBuilder.Entity<Employee>()
                .HasMany(e => e.SalaryStructures)
                .WithOne(s => s.Employee)
                .HasForeignKey(s => s.EmployeeId);
            // One-to-many: Employee -> Payrolls
            modelBuilder.Entity<Employee>()
                .HasMany(e => e.Payrolls)
                .WithOne(p => p.Employee)
                .HasForeignKey(p => p.EmployeeId);

            // One-to-many: User (Processor) -> Payrolls
            // Processor relationship
            modelBuilder.Entity<Payroll>()
                .HasOne(p => p.Processor)
                .WithMany(u => u.ProcessedPayrolls)
                .HasForeignKey(p => p.ProcessedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Verifier relationship
            // Avoid multiple cascade paths by restricting deletion
            modelBuilder.Entity<Payroll>()
                .HasOne(p => p.Verifier)
                .WithMany(u => u.VerifiedPayrolls)
                .HasForeignKey(p => p.VerifiedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-many: User (Approver) -> TimeSheets
            modelBuilder.Entity<User>()
                .HasMany(u => u.ApprovedTimeSheets)
                .WithOne(t => t.Approver)
                .HasForeignKey(t => t.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // Roles and Users
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }

        // Refresh tokens
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        // Audit Logs
        public DbSet<AuditLog> AuditLogs { get; set; }

        // Employee
        public DbSet<Employee> Employees { get; set; }

        // Time Sheet
        public DbSet<TimeSheet> TimeSheets { get; set; }

        // Leave request
        public DbSet<LeaveRequest> LeaveRequests {  get; set; }

        // Payroll Management
        public DbSet<SalaryStructure> SalaryStructures { get; set; }
        public DbSet<Benefit> Benefits { get; set; }
        public DbSet<PayrollPolicy> PayrollPolicies {  get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
    }
}
