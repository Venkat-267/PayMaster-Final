using Microsoft.EntityFrameworkCore;

namespace PayMaster.Models
{
    public class TokenService
    {
        private readonly PayMasterDbContext _context;
        // Constructor that intializes the TokenService with an instance of the database context.
        public TokenService(PayMasterDbContext context)
        {
            _context = context;
        }

        // Asynchronously saves a new refresh token to db
        public async Task SaveRefreshToken(string username, string token)
        {
            // Create a new refresh token object
            var refreshToken = new RefreshToken
            {
                Username = username, // set the username
                Token = token, // set the token value
                ExpiryDate = DateTime.UtcNow.AddDays(7) // set the expiry date 
            };

            // Add the new refresh token to the corresponding DbSet in the db
            _context.RefreshTokens.Add(refreshToken);
            // Save changes to Db Async
            await _context.SaveChangesAsync();
        }

        // Retrieve the username associated to specific refresh token
        public async Task<string> RetrieveUsernameByRefreshToken(string refreshToken)
        {
            // Find the refresh token and the exipry date
            var tokenRecord = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.ExpiryDate > DateTime.UtcNow);
            // return the username if token found and valid, or else return null
            return tokenRecord?.Username;
        }

        // Delete a refresh token from Db
        public async Task<bool> RevokeRefreshToken(string refreshToken)
        {
            // Find the refresh token in the Db
            var tokenRecord = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            // if token exist, delte it
            if(tokenRecord != null)
            {
                _context.RefreshTokens.Remove(tokenRecord);
                // Save changes to the Db
                await _context.SaveChangesAsync();
                return true;
            }
            return false; // THe token not found
        }
    }
}
