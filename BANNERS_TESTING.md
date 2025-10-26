## Testing the Banners Implementation

To test the admin banners functionality, follow these steps:

### 1. Database Setup
Make sure your Supabase database has the banners table and storage bucket set up:
1. Run the SQL scripts from the Supabase Setup Guide
2. Create an `images` storage bucket in Supabase dashboard
3. Set up RLS policies as described in the setup guide

### 2. Admin User Setup
1. Create a user account in your app
2. In Supabase dashboard, go to Authentication > Users
3. Find your user and set their role to 'admin' in the users_meta table:
```sql
INSERT INTO users_meta (user_id, role, name)
VALUES ('your-user-id', 'admin', 'Admin User')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 3. Testing Steps
1. **Start the development server:**
```bash
npm run dev
```

2. **Access the admin panel:**
   - Go to `/auth/login` and log in with your admin account
   - Navigate to `/admin/banners`

3. **Test Banner Management:**
   - **View Banners:** The page should display a table with existing banners (or empty if none exist)
   - **Create Banner:** Click "Add Banner" and fill in:
     - Title (required)
     - Position (optional, defaults to next available)
     - Active checkbox (optional, defaults to active)
     - Upload an image file
   - **Edit Banner:** Click the edit icon on any banner to modify it
   - **Delete Banner:** Click the delete icon and confirm deletion
   - **Search:** Use the search box to filter banners by title

### 4. API Testing
You can test the API endpoints directly:

**Get all banners:**
```bash
curl http://localhost:3000/api/banners
```

**Create a banner (requires authentication):**
```bash
curl -X POST http://localhost:3000/api/banners \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Banner" \
  -F "position=1" \
  -F "is_active=true" \
  -F "image=@/path/to/image.jpg"
```

### 5. Troubleshooting
- **"Failed to fetch banners":** Check if the banners table exists in your database
- **Image upload fails:** Verify the storage bucket exists and RLS policies are set up correctly
- **Permission errors:** Ensure your user has admin role in users_meta table
- **Toast notifications not showing:** Check if the Toaster component is properly added to the root layout

### 6. Features Implemented
✅ Admin authentication and role checking
✅ Banner CRUD operations (Create, Read, Update, Delete)
✅ Image upload to Supabase Storage
✅ Search and filtering functionality
✅ Responsive table with actions
✅ Toast notifications for feedback
✅ Form validation and error handling
