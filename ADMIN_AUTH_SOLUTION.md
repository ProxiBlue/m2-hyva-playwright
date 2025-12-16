# Admin Authentication Configuration

## Requirements

Admin tests require a valid admin username and password to be configured in the `config.private.json` file for each app.

### Configuration

Add the following fields to your app's `config.private.json` file:

```json
{
  "admin_path": "admin",
  "admin_username": "your_admin_username",
  "admin_password": "your_admin_password"
}
```

### Magento Admin Configuration

For admin tests to work properly with multiple sessions, you must configure the following setting in your Magento admin:

**Admin > Stores > Configuration > Advanced > Admin > Security**

Set **Admin Account Sharing** to `Yes` (value: 1)

This allows multiple admin sessions to be active simultaneously, which is required for parallel test execution.

### Path Configuration

- `admin_path`: The admin URL path for your Magento installation (default: "admin")
- `admin_username`: A valid admin user account username
- `admin_password`: The password for the admin user account

Make sure the admin user account has the necessary permissions to perform the actions required by your tests.
