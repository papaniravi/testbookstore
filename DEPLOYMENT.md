# Bookstore Application - On-Premise Deployment Guide

## Architecture Overview

This deployment follows the same pattern as your RAP-based P2P application:
- **UI5 Application**: Deployed to on-premise ABAP system
- **CAP Backend**: Can be deployed to BTP or on-premise
- **Connection**: BTP Destination to connect UI to backend

## Deployment Options

### Option 1: UI5 App to ABAP + CAP Backend on BTP (RECOMMENDED)

This mirrors your existing P2P application setup.

#### Step 1: Deploy CAP Backend to BTP Cloud Foundry

```bash
# Install Cloud Foundry CLI
cf login -a https://api.cf.eu10.hana.ondemand.com

# Build and deploy
cds build --production
cf push
```

#### Step 2: Create BTP Destination

1. Go to BTP Cockpit → Connectivity → Destinations
2. Create new destination with these properties:
   - **Name**: `BOOKSTORE_BACKEND`
   - **Type**: HTTP
   - **URL**: `https://your-cap-app.cfapps.eu10.hana.ondemand.com`
   - **Proxy Type**: Internet
   - **Authentication**: NoAuthentication (or configure as needed)
   - **Additional Properties**:
     - `WebIDEEnabled`: true
     - `WebIDEUsage`: odata_gen

#### Step 3: Update manifest.json to Use Destination

Update `app/bookstore-listview/webapp/manifest.json`:

```json
"dataSources": {
  "mainService": {
    "uri": "/sap/opu/odata4/sap/bookstore_srv/srvd/sap/bookstore/0001/",
    "type": "OData",
    "settings": {
      "odataVersion": "4.0",
      "localUri": "localService/metadata.xml"
    }
  }
}
```

Or use the destination directly:
```json
"dataSources": {
  "mainService": {
    "uri": "/destinations/BOOKSTORE_BACKEND/odata/v4/bookstore/",
    "type": "OData",
    "settings": {
      "odataVersion": "4.0"
    }
  }
}
```

#### Step 4: Deploy UI5 App to ABAP System

```bash
# Navigate to UI5 app folder
cd app/bookstore-listview

# Install dependencies
npm install

# Set environment variables for ABAP system credentials
export ABAP_USERNAME=your-username
export ABAP_PASSWORD=your-password

# Update ui5-deploy.yaml with your ABAP system details:
# - URL: https://your-system.com:443
# - Client: 100 (or your client)
# - Package: ZLOCAL (or create a custom package)
# - App Name: ZBOOKSTORE

# Deploy to ABAP
npm run deploy
```

#### Step 5: Configure Cloud Connector (if backend is on-premise)

If your CAP backend runs on-premise:
1. Install SAP Cloud Connector
2. Configure tunnel to on-premise system
3. Update BTP destination to use `OnPremise` proxy type

---

### Option 2: Full On-Premise Deployment

#### Deploy CAP Backend On-Premise

1. **Install Node.js** on your on-premise server (version 20+)

2. **Configure Production Database**:
```bash
npm install @cap-js/hana
# or
npm install @cap-js/postgres
```

3. **Update package.json** with production profile:
```json
{
  "cds": {
    "requires": {
      "db": {
        "kind": "hana",
        "credentials": {
          "host": "your-hana-host",
          "port": 30015,
          "user": "SYSTEM",
          "password": "password",
          "schema": "BOOKSTORE"
        }
      }
    }
  }
}
```

4. **Build and Start**:
```bash
npm install --production
cds build --production
node server.js
```

5. **Configure Reverse Proxy** (Apache/Nginx) to expose backend

#### Deploy UI5 App to ABAP

Same as Option 1, Step 4, but update the manifest.json to point to your on-premise backend URL.

---

## Pre-Deployment Checklist

### UI5 App Configuration

- [ ] Update `ui5-deploy.yaml` with ABAP system details:
  - URL
  - Client
  - Package name
  - BSP application name

- [ ] Update `manifest.json` with backend service URI

- [ ] Set environment variables:
  ```bash
  export ABAP_USERNAME=your-username
  export ABAP_PASSWORD=your-password
  ```

### CAP Backend Configuration

- [ ] Update database configuration
- [ ] Configure authentication/authorization
- [ ] Set up environment variables
- [ ] Test OData service endpoints

---

## Commands Reference

### UI5 App Commands

```bash
# Build the UI5 application
npm run build

# Deploy to ABAP
npm run deploy

# Undeploy from ABAP
npm run undeploy
```

### CAP Backend Commands

```bash
# Development
npm start

# Production build
cds build --production

# Deploy to Cloud Foundry
cf push

# Deploy to XSA
xs push
```

---

## Configuration Files Created

1. **`ui5-deploy.yaml`**: ABAP deployment configuration
2. **`manifest-deploy.json`**: Deployment-specific manifest settings
3. **Updated `ui5.yaml`**: Backend proxy and preview configuration
4. **Updated `package.json`**: Deployment scripts

---

## Troubleshooting

### UI5 Deployment Issues

**Error: "Authentication failed"**
- Check ABAP_USERNAME and ABAP_PASSWORD environment variables
- Verify user has authorization to upload BSP applications

**Error: "Package does not exist"**
- Create the package in SE80 first
- Ensure package is not a local package for transport-based deployments

**Error: "Transport required"**
- Create a transport request
- Update ui5-deploy.yaml with transport number

### Backend Connection Issues

**CORS Errors**
- Configure CORS in CAP backend:
```javascript
// srv/server.js
cds.on('bootstrap', app => {
  app.use(require('cors')())
})
```

**Destination Not Found**
- Verify destination name matches manifest.json
- Check destination is configured in BTP cockpit
- Ensure Cloud Connector is running (for on-premise)

---

## Production Considerations

1. **Authentication**: Configure proper authentication (SAML, OAuth)
2. **HTTPS**: Use HTTPS for all connections
3. **Monitoring**: Set up application monitoring
4. **Logging**: Configure structured logging
5. **Backup**: Regular database backups
6. **Performance**: Enable caching, compression

---

## Similar to Your P2P Application

Your working setup used:
- Backend: `https://ds4.ergon.com:443` (RAP on-premise)
- UI5 deployed to ABAP
- Connection via fiori-tools-proxy

This Bookstore app follows the same pattern:
- Backend: CAP application (BTP or on-premise)
- UI5 deployed to ABAP (same process)
- Connection via BTP destination or direct proxy

The main difference is CAP vs RAP backend - the deployment process is similar.
