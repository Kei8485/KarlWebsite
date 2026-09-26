# ApexEng

An engineering learning platform built with **Ionic + Angular** (frontend) and **Django + Django REST Framework** (backend).

---

## Deployment

- **Frontend:** Hosted on [Netlify](https://netlify.com) (e.g. `apexeng.netlify.app`)
- **Backend:** Hosted on [Render](https://render.com) (e.g. `apexeng-api.onrender.com`)
- **Database:** Hosted on [Supabase](https://supabase.com)

Deployment Step — Set Up the Database in Supabase
Deploy the database in Supabase first
Create a new Supabase project
Select an Asia region
Leave the initial optional setting/checkbox unchecked as you did during project creation
After the project is created, click Connect
Get the PostgreSQL connection information from:
Direct connection
Session Pooler
Copy the database connection details needed for Django.
Configure Django for Supabase
Fix/update the .env file with the Supabase database information:
DB_NAME=postgres
DB_USER=postgres.awrvncbeiuuogzlbdyvb
DB_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
Update settings.py so Django can read .env:
from dotenv import load_dotenv

load_dotenv()
Make sure the database configuration uses the environment variables:
DATABASES = {
'default': {
'ENGINE': 'django.db.backends.postgresql',
'NAME': os.environ.get('DB_NAME'),
'USER': os.environ.get('DB_USER'),
'PASSWORD': os.environ.get('DB_PASSWORD'),
'HOST': os.environ.get('DB_HOST'),
'PORT': os.environ.get('DB_PORT', '5432'),
}
}
Install the Required Packages
Install the PostgreSQL driver:
pip install psycopg2-binary
Install .env support:
pip install python-dotenv
Connect Django to Supabase
Check Django configuration:
python manage.py check
Run the database migrations:
python manage.py migrate
The migrations successfully created the Django tables in Supabase.
Set Up the Admin Account
Check whether a superuser exists in the new Supabase database.
Since there wasn't one, create a new superuser:
python manage.py createsuperuser
Verify the superuser exists:
python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(is_superuser=True).values('username','email'))"
Test the Connection
Start Django locally:
python manage.py runserver
Open:
http://127.0.0.1:8000/admin/
Log in successfully to Django Admin.

-add this in the setting -> from dotenv import load_dotenv
load_dotenv()

-

### Email delivery for new users

Supabase is the database in this setup; it does not configure application email. Configure an SMTP provider separately in the Django deployment environment (for example, Render). Use a verified sender address and set:

```text
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=your-verified-sender@example.com
EMAIL_HOST=your-provider-smtp-host
EMAIL_PORT=587
EMAIL_HOST_USER=your-provider-username
EMAIL_HOST_PASSWORD=your-provider-password
EMAIL_USE_TLS=true
```

Do not commit real SMTP credentials. The Django console email backend only prints messages to server output and does not send email. New-user creation now returns an error and rolls back the account unless the email backend accepts the access-code email. Acceptance means the SMTP provider accepted the message; it cannot guarantee delivery to the recipient's inbox. If delivery fails in production, check the Django service's logs for a failure type such as SMTP authentication failure, timeout, or DNS error; credentials are not written to the logs.

### Capacity notes

- Estimated load: 20–30 concurrent users.
- Research suggests the current setup can comfortably handle up to ~500 users.
- Optimizations to keep the free-tier hosting lightweight:
  - Videos are linked from YouTube instead of being uploaded/hosted directly.
  - Profile pictures were removed so the server doesn't have to store/serve images.

> **⚠️ Important — Render free tier "sleep" behavior:**
> Since users are paying for access, keep in mind that Render's free tier puts the backend to sleep after 15 minutes of inactivity. The next login attempt after that will take roughly 30–50 seconds while the server wakes up.

---

## Project Structure

```
karlWebsite_api/     # Project settings
karlWebsite-api/     # Core app — models, API logic, migrations
manage.py            # Entry point (equivalent to a Java main class)
```

---

## Getting Started

### Running the backend

```bash
# from the api folder
venv\Scripts\activate       # activate the virtual environment
python manage.py runserver  # start the backend server
```

### Backend setup (from scratch)

```bash
mkdir <project-folder>
cd <project-folder>

python -m venv venv               # create a virtual environment
venv\Scripts\activate             # activate it

pip install django djangorestframework django-cors-headers

django-admin startproject project_name .   # scaffolds settings.py, etc.
python manage.py startapp core             # creates models, migrations, apps (run once)
python manage.py runserver                 # run the server
```

Add the following to `settings.py`:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'core',
]
```

### Backend build order

1. **Models** — done
2. **Migrations**
   ```bash
   python manage.py makemigrations   # generate migration files (rerun after any model change)
   python manage.py migrate          # apply migrations / build the schema
   python manage.py createsuperuser  # create a superuser (full permissions, distinct from a regular admin)
   ```
3. **Admin setup** — register models in `admin.py`
4. **Gmail API** — email config added to `settings.py`; used for sending auto-generated emails from the admin panel
5. **Building the API**
   - `serializers.py` converts Python objects to JSON.
   - Data flow: **Database → Models → Serializer (object → JSON) → HTTP response → Angular frontend**
6. **Connecting the URLs**
   - Define API views in `views.py` (snake_case is the convention for API function names).
   - Wire up `urls.py` with the corresponding paths.
   - Verify GET/POST endpoints in Postman before connecting the frontend.

---

## Frontend (Ionic + Angular)

> Uses **standalone components** to avoid extra boilerplate/bugs and keep the file structure lean.

### Useful CLI commands

```bash
ionic start my-app-name blank --type=angular-standalone

ionic g p pages/topic-detail --standalone        # generate a page
ionic g c components/atoms/my-button --standalone # generate a component
ionic g s services/auth                          # generate a service
```

### Feature build log

**Login page**

- Initial scaffold: `ionic start` → `ionic serve`, removed the default `home` page.
- Generated `pages/login`, `pages/subjects`, `pages/topic-detail`.
- Generated a reusable `atoms/app-button` component and a `services/auth` service (bridges frontend data to the backend).

**Subjects page**

- Added `username` to the model/database (`makemigrations` after the change).
- Built a subject card component.
- Connected frontend ↔ backend logic for subjects.

**Topic tree page**

- Clicking a subject routes to its topics via Angular routing.
- Built a topic card component.
- Connected frontend ↔ backend logic; fetches data via `GET` and replaces the placeholder data in the `.ts`/`.html` files.

**Admin page**

- Standalone component with its own design.
- Core logic: add/delete users, restricted to admin accounts only.
- Added a model method to replace manual account creation via the Django superuser flow.
- Wired into the auto-email (Gmail) flow.
- Includes a filter in the UI and validation modals on every action.
- Security-hardening (API auth/permissions) was tackled last, with AI assistance for the syntax, since this was new territory.

**Planner page**

- Built the design and connected it to the backend.
- Add/edit tasks, plus scheduling for study time (most of this logic was AI-assisted — fairly complex).
- Uses the REST email code generator.
- Three core functions:
  1. Pomodoro-style focus timer
  2. To-do task CRUD with scheduling
  3. Study session scheduling — sends an email reminder when the session starts
- Validation: users can't select past times; all actions require confirmation.

**Community page**

- Simple frontend logic — a single button linking out to a Messenger group chat.

**User settings page**

- Editable: username, password.
- Not editable: email.
- Profile picture editing was intentionally left out to keep the free-tier hosting lightweight.
- Includes validation and confirmation on changes.

---

## Frontend Concepts & Lessons Learned

### Building a component

```ts
@Component({
  selector: "app-button",
  templateUrl: "./app-button.component.html",
  styleUrls: ["./app-button.component.scss"],
  standalone: true,
  imports: [CommonModule, IonButton],
})
export class AppButtonComponent {
  @Input() label: string = "Button";
  @Input() variant: "primary" | "outline" = "primary";
  @Input() disabled: boolean = false;
  @Input() size: "small" | "medium" | "large" = "medium";
  @Output() clicked = new EventEmitter<void>();
}
```

- `selector` defines the custom element tag (`<app-button>`) used in templates.
- `@Input()` properties (`label`, `variant`, `disabled`, `size`) configure the component's behavior/appearance; the value after `=` is the default.
- `variant` maps to SCSS modifier classes, e.g.:
  ```scss
  &--primary {
    --background: var(--primary);
    --color: var(--primary-foreground);
  }
  ```
  The `&--<value>` naming matches the value passed into the `variant` input.

### How the pieces connect

- HTML/SCSS are tied to their `.ts` file, which in turn is the "parent" holding the page's logic.
- The `.ts` file is where Ionic modules, HTTP requests, and validation logic live — any new logic goes here.

### HTTP error handling

Similar to try/catch, but for network requests — used to handle failed API calls gracefully.

### ORM

**ORM = Object-Relational Mapping** — lets you work with the database using Python objects instead of raw SQL.

### Modals

Requires a component to be created first, then presented via `ModalController`:

```ts
const modal = await this.modalCtrl.create({
  component: ConfirmModalComponent,
  cssClass: "transparent-modal",
  componentProps: {
    title: "Delete Account?",
    message: `Are you sure you want to permanently delete <strong>${nameToDisplay}</strong>? This cannot be undone.`,
    confirmText: "Delete",
    isDanger: false, // toggles the modal's danger color scheme
  },
});
```

- `modalCtrl` is Ionic's modal controller.
- The method must be `async` since a pause is expected while the modal is open.
- `await` triggers the pause; `present()` handles the animation; a second `await` retrieves the result once the user responds.

### RxJS & Observables (used in Auth)

|                  | Observable                                                                                                                     | Async / Await                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **Use case**     | Continuous/ongoing data streams (stopwatch, live clock, repeating interval)                                                    | Pausing for a single result (a delay, an API fetch) |
| **Subscription** | Uses `subscribe()` / `unsubscribe()` — though HTTP calls auto-unsubscribe, and login typically redirects to a new route anyway | N/A                                                 |
| **Handles**      | Multiple/ongoing values                                                                                                        | One value                                           |

**Auth service flow:**

1. Import RxJS in the service class.
2. `@Injectable({ providedIn: 'root' })` so it's available app-wide.
3. Inject `HttpClient` via the constructor.
4. Create a `login()` method to send frontend credentials to the backend for comparison.

**Using it in a component:**

- Import the `AuthService`.
- Call its method with `.subscribe({ next, error })`.
- On `next`: store the returned data in `localStorage` (so the app knows the user is logged in).
- On `error`: handle/display the failure.

---

## Next Steps

- Study how URLs, serializers, and views work together in more depth.
