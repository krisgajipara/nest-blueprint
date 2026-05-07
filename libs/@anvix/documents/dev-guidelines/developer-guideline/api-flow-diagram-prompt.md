# API Flow Diagram Creation Prompt

## 🎯 **Purpose**

Use this prompt to generate comprehensive API flow diagrams for any REST API module, ensuring consistent documentation and frontend integration guidance.

## 📋 **Prompt Template**

```
Create a comprehensive API flow diagram for the [MODULE_NAME] module with the following structure:

### **Required Sections:**

0. **Frontend handoff bundle** (place immediately after the document title / module metadata when the doc is for UI or API-client teams)
   - **HTTP:** base URL pattern, global version prefix, `Content-Type: application/json`.
   - **Headers:** `Authorization: Bearer <accessToken>` where guards apply; tenant headers (`x-tenant` or `x-tenant-id`) per `TENANT_GUIDE.md` for tenant-scoped flows; optional `language_code` if the app uses it on errors/success messages.
   - **Success envelope:** `AppResponse` shape — `message` (may be translated), `data` (DTO or wrapped list). Note when `data` is `{}`.
   - **Error envelope:** global filter returns `message` (display-safe key or translated string) and `developerErrors` (detail array). Map common **HTTP status + `message` keys** to suggested UI (toast, inline field, redirect to login).
   - **Journey table:** columns such as *Screen* | *User action* | *HTTP* | *Auth* | *Persist on client* | *Next step*.
   - **Enums in JSON:** document numeric/string values as the API actually accepts (e.g. `OtpType` in this repo is numeric).
   - **Automation:** optional JSON list of `{ "method", "path", "auth", "bodySummary" }` for codegen, OpenAPI cross-check, or LLM tool-calling.

1. **Complete API Flow Visualization**
   - Create ASCII flow diagrams for each major user journey
   - Show the complete flow from UI interaction to API response
   - Include success and error paths
   - Use consistent ASCII box formatting

2. **Feature-to-API Mapping**
   - Map each frontend feature to its corresponding API endpoints
   - Break down UI components, state management, and validation
   - Show the technical implementation details

3. **API Integration Priority**
   - Organize APIs by implementation phase (Core, Enhancement, Advanced)
   - Provide timeline recommendations
   - Show dependencies between APIs

4. **Template for Future API Additions**
   - Include templates for adding new APIs consistently
   - Provide ASCII diagram template
   - Include feature mapping template
   - Create API change log format

5. **Error Handling Flow**
   - Network error scenarios
   - Authentication/authorization errors
   - Business logic errors
   - User-friendly error messaging

### **Guidelines for Flow Diagrams:**
- Use ASCII box formatting: ┌─────────────┐││└──────┬──────┘
- Show user actions with arrows: → or ▼
- Include all possible paths (success, error, edge cases)
- Use clear, descriptive labels
- Group related flows together

### **Guidelines for Feature Mapping:**
- Break down into: API Call, UI Components, State Management, Validation
- Show the frontend implementation details
- Include specific component examples
- Show data flow and state changes

### **Guidelines for Integration Priority:**
- Phase 1: Core functionality (must-have APIs)
- Phase 2: Important features (should-have APIs)
- Phase 3: Enhanced features (nice-to-have APIs)
- Provide time estimates and dependencies

### **Guidelines for Templates:**
- Provide reusable ASCII diagram templates
- Create consistent feature mapping structure
- Include versioning and change tracking
- Show how to add new APIs maintaining consistency

### **Technical Requirements:**
- Use consistent formatting and terminology
- Include code examples where helpful
- Provide real-world usage scenarios
- Show integration order and dependencies
- Include maintenance guidelines

### **Output Format:**
- Use clear markdown headers (##, ###, ####)
- Include ASCII diagrams with proper formatting
- Use code blocks for TypeScript examples
- Provide bullet points and numbered lists
- Include templates that can be copy-pasted

### **Quality Checklist:**
- [ ] All major user journeys are covered
- [ ] Flow diagrams are clear and complete
- [ ] Feature mappings are detailed
- [ ] Integration priorities are logical
- [ ] Templates are reusable
- [ ] Error handling is comprehensive
- [ ] Documentation is maintainable
```

## 🔄 **How to Use This Prompt**

### **Step 1: Prepare Information**

Before using the prompt, gather:

- List of all API endpoints in the module
- User stories and user journeys
- UI components and screen flows
- Error scenarios and handling
- Dependencies between APIs

### **Step 2: Customize the Prompt**

Modify the prompt for your specific module:

```
Create a comprehensive API flow diagram for the [PRODUCT_MODULE] module with the following structure:
```

### **Step 3: Add Module-Specific Requirements**

Add any specific requirements for your module:

- Authentication requirements
- Data validation rules
- Performance considerations
- Security requirements

### **Step 4: Use with AI Tools**

Apply this prompt with your preferred AI tool:

- ChatGPT, Claude, or similar
- Provide your API documentation
- Request the comprehensive flow diagram
- Review and refine the output

## 📝 **Example Usage**

### **Sample Request:**

```
Create a comprehensive API flow diagram for the INVENTORY_MODULE with these APIs:
- POST /inventory/products
- GET /inventory/products/:id
- PUT /inventory/products/:id
- DELETE /inventory/products/:id
- POST /inventory/categories
- GET /inventory/search

Follow the structure from the API flow diagram prompt.
```

### **Expected Output Sections:**

1. **Product Management Flow** - CRUD operations visualization
2. **Search & Discovery Flow** - Search API integration
3. **Category Management Flow** - Category operations
4. **Feature-to-API Mapping** - Frontend integration details
5. **API Integration Priority** - Implementation phases
6. **Templates for Future APIs** - Reusable structures
7. **Error Handling Flow** - Comprehensive error scenarios

## 🎨 **ASCII Diagram Examples**

### **Simple API Flow:**

```
┌─────────────┐
│  UI ACTION  │
│  /action    │
└──────┬──────┘
       │ User clicks
       ▼
┌─────────────────────┐
│  POST /api/action   │
└──────┬──────────────┘
       │
       ├─► Success
       │   └─ Update UI
       │
       └─► Error
           └─ Show Error Message
```

### **Complex Flow with Multiple Paths:**

```
┌─────────────┐
│  USER PAGE  │
│   /user     │
└──────┬──────┘
       │ User wants to update
       ▼
┌─────────────────────┐
│  PUT /api/user/:id  │
└──────┬──────────────┘
       │
       ├─► Valid Data
       │   └─ Success Response
       │
       └─► Invalid Data
           └─ Validation Error
               └─ Show Form Errors
```

## 🔧 **Customization Options**

### **Add Module-Specific Sections:**

```
### **Module-Specific Features for [MODULE_NAME]:**
- Business rules and validation
- Security considerations
- Performance requirements
- Integration patterns
```

### **Add Industry-Specific Requirements:**

```
### **Industry Requirements for [INDUSTRY]:**
- Compliance standards
- Data privacy requirements
- Audit trail needs
- Performance benchmarks
```

## 📊 **Quality Standards**

### **Diagram Quality:**

- All flows start and end clearly
- No orphaned paths or dead ends
- Consistent formatting throughout
- Clear success/error separation
- User-friendly error messages

### **Documentation Quality:**

- Complete feature coverage
- Clear technical details
- Reusable templates
- Maintainable structure
- Version control ready

### **Integration Quality:**

- Realistic user scenarios
- Logical API sequence
- Proper error handling
- Frontend implementation details
- State management guidance

### **Multi-Module Diagrams:**

Create separate diagrams for each module, then create an overall system flow showing how modules interact.

### **Version Management:**

Include version information in your diagrams:

```
### **Version 1.0 - Initial Implementation**
### **Version 1.1 - Added enhanced search features**
```

### **Automated Updates:**

Use the templates to create scripts or processes that automatically update diagrams when APIs change.

## 🎯 **Best Practices**

1. **Keep Diagrams Up-to-Date** - Update whenever APIs change
2. **Use Consistent Formatting** - Maintain visual consistency
3. **Include Real Examples** - Use actual API responses and requests
4. **Test with Frontend Team** - Validate flows match implementation
5. **Version Control** - Track changes and improvements
6. **Templates First** - Always use the provided templates for consistency

## 📚 **Related Resources**

- API documentation standards
- RESTful API design principles
- Frontend integration patterns
- Error handling best practices
- User experience guidelines

---

**Usage Note**: This prompt template ensures consistent, comprehensive, and maintainable API flow documentation that will serve your team effectively across all future API modules.
