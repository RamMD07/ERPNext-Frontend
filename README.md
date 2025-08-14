# ERPNext Vue.js Frontend

A modern, metadata-driven frontend for ERPNext built with Vue.js 3, Frappe UI, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- ERPNext instance running (local or remote)
- Basic knowledge of Vue.js and ERPNext

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd erpnext-vue-frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open browser and navigate to:** `http://localhost:3000`

## 🔧 ERPNext Integration Setup

### Step 1: Configure ERPNext Server

1. **Enable CORS in ERPNext** (if running on different port):
   
   Add to your `site_config.json`:
   ```json
   {
     "allow_cors": "*",
     "cors_headers": [
       "Authorization",
       "Content-Type",
       "X-Frappe-CSRF-Token"
     ]
   }
   ```

2. **Create API User** (recommended):
   ```bash
   # In ERPNext bench directory
   bench --site [your-site] add-user api@yourcompany.com --first-name API --last-name User
   bench --site [your-site] set-user-password api@yourcompany.com [password]
   ```

3. **Set User Permissions:**
   - Go to User > API User
   - Assign appropriate roles (System Manager for testing)
   - Enable "API Access"

### Step 2: Configure Frontend

1. **Update Server URL:**
   - Open the login page
   - Click "Server Configuration"
   - Enter your ERPNext URL (e.g., `http://localhost:8000`)
   - Click "Test Connection"

2. **Login:**
   - Use your ERPNext credentials
   - For development: `Administrator` / `admin`
   - For production: Use the API user created above

### Step 3: Test Integration

1. **Test Login:**
   - Should redirect to dashboard after successful login
   - Check browser console for any errors

2. **Test List View:**
   - Navigate to any DocType (e.g., `/selling/Customer`)
   - Should load and display records from ERPNext

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── forms/          # Form-related components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── composables/        # Vue composables
│   └── useApi.ts       # Frappe API integration
├── pages/              # Page components
├── stores/             # Pinia stores
├── types/              # TypeScript type definitions
└── router/             # Vue Router configuration
```

## 🔌 API Integration Details

### Authentication Flow
```typescript
// Login
const user = await frappeAPI.login('username', 'password')

// Auto-authentication check
await authStore.checkAuth()

// Logout
await authStore.logout()
```

### Data Fetching
```typescript
// Get DocType metadata
const doctype = await frappeAPI.getDocType('Customer')

// Get list of documents
const customers = await frappeAPI.getList('Customer', {
  fields: ['name', 'customer_name', 'territory'],
  filters: { disabled: 0 },
  limit_page_length: 20
})

// Get single document
const customer = await frappeAPI.getDoc('Customer', 'CUST-001')
```

## 🎨 Customization

### Adding New DocTypes
1. The app automatically discovers DocTypes from ERPNext
2. List views are generated based on `in_list_view` field property
3. Forms are generated based on DocType field metadata

### Custom Field Rendering
Extend `FieldRenderer.vue` to support custom field types:

```vue
<!-- Add new field type -->
<div v-else-if="field.fieldtype === 'Custom Type'">
  <!-- Your custom field implementation -->
</div>
```

### Styling
- Uses Tailwind CSS for styling
- Frappe UI components for consistency
- Dark/light theme support built-in

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure CORS is enabled in ERPNext
   - Check `allow_cors` in site_config.json

2. **Authentication Fails:**
   - Verify ERPNext credentials
   - Check if user has API access enabled
   - Ensure ERPNext server is running

3. **Empty List Views:**
   - Check user permissions for the DocType
   - Verify DocType exists and has records
   - Check browser console for API errors

4. **Connection Test Fails:**
   - Verify ERPNext URL is correct
   - Ensure ERPNext server is accessible
   - Check firewall/network settings

### Debug Mode
Enable debug logging:
```typescript
// In browser console
localStorage.setItem('debug', 'true')
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env.production`:
```env
VITE_FRAPPE_URL=https://your-erpnext-domain.com
```

### Deployment Options
- **Nginx:** Serve built files with proxy to ERPNext
- **Frappe App:** Package as Frappe app for integrated deployment
- **CDN:** Deploy to Vercel, Netlify, or similar platforms

## 📚 Next Steps

1. **Implement Form Views:** Complete CRUD operations
2. **Add Real-time Updates:** WebSocket integration
3. **Mobile Optimization:** Responsive design improvements
4. **Performance:** Virtual scrolling for large lists
5. **Testing:** Unit and integration tests
6. **Documentation:** API documentation and guides

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details