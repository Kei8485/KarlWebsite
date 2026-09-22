documentation

when publish (tatry dito kung kaya ihandle pag pinublish)
Frontend: Hosted on Netlify (e.g., apexeng.netlify.app)
Backend: Hosted on Render (e.g., apexeng-api.onrender.com)

-estimated users 20-30???
can the server handle it
-base sa research(AI hehe) kaya daw upto 500 users
-try to make it optimized like:
-using youtube links instead of actual posting it in the website
-removes the profile pic so the server doesn't have to worry about posting any image

another thing (sabi ng AI)
🚨 The Only Catch (Important since users are paying!): Because Render is free, it has a "Sleep" feature. If nobody visits the website for 15 minutes, Render puts your backend to sleep to save money. When the next student tries to log in, it will take about 30 to 50 seconds for the server to wake up.

---

karlWebsite_api - holds the project setting
karlWebsite-api - has the core. (models, api logic, migration)
manage.py - eto ung pinaka irurun parang sa java main class

- - - - terminal prompt for starting - - - -
        Run this to run virtual environment - venv\Scripts\activate (mag cd muna sa api folder)
        Run to run the backend server - python manage.py runserver

for installing the jdongo frame work - pip install django djangorestframework django-cors-headers

steps

1.  backend first
    \*run this commands (setup na ginawa ko) - mkdir name of folder (pang create ng folder) - cd name of folder

            - python -m venv venv (for creating a virtual environment)
            - venv\Scripts\activate (starting the virtual environment) (eto ung asa taas na command)
            - pip install django djangorestframework django-cors-headers (need to install para maconnect ung backend and frontend)

            - django-admin startproject project_name .  (creates the folder structure parang ionic start) (ex. setting.py)
            - python manage.py startapp core   (runs the manage.py) (ex. , migrations, models,apps) (run once)
            - python manage.py runserver (run in the server)

            - lalagay to sa setting.py
            INSTALLED_APPS = [
                ...
                'rest_framework',
                'corsheaders',
                'core',
            ]



        *Done the Model
        *Done Migration
            run for migration - |python manage.py makemigrations | - creates migration files (inside the migration folder) and related files (uulitin ulit command nato pag may naupdate sa model)
            | python manage.py migrate | - creates the sql queries na naka base sa model mo (automatic) (ran this if there is a updated model this will create a updated database)
            | python manage.py createsuperuser |- for the super admin - bypass all permision (different from admin)

        *Done admin setup
            - register the models

        *Done Gmail API
            - add email config in the settings.py
            - putting the auto email in the admin

        *Done Building the API
            -create new file inside core folder -  | serializers.py | - converting obj to json
            -Current data flow:
                Database -> Models -> Serializer(converts the python obj to json) -> HTTP response (sends the data from backend to frontend) ->Angular (frontend dito lalabas)

        *Done Connecting the URL
            -Go to the views.py and create the api (when creating a API function snake_casing is better)
            -Create new urls.py (putting the paths of the url)
            -check in postman if the urls are working (the GET and POST)

2.  Front end
    ** dapat ionic standalone gagamitin para iwas bugs and less files and folders **
    (development ng login page)
    -run ionic start tas ionic serve
    -delete ung home.page folder
    -replace and run these: (automatically creates templete )
    *ionic generate page pages/login
    *ionic generate page pages/subjects
    \*ionic generate page pages/topic-detail
    -run for atomic folder - ionic generate component components/atoms/app-button
    -run for creating a page - ionic generate page pages/dev-preview
    -run for generating auth - ionic generate service services/auth (kailangan to para ibigay ng frontend ung data sa backend)

        (Development of Subject page)
        - added username in the model and in the database (need this) -> python manage.py makemigrations
        - created a card component
        - connects the frontend  and backend logic of the subject

        (Development of Topic Tree page)
        -when a subj is click it takes it to the corresponding subject using the routes (maraming gagawin dito na logic)
        -Created a topic card component
        -connects the front and backend logic of the topics
        -uses GET HTTP method to get the datas
        -replaces the current temporary datas inside the ts and html

        (development of the admin page)
        -creates new pages standalone component
        -creates the design of the admin page
        -main logic: Add users and delete users here
        -only admins can access this: also created this logic
        -creates a new method inside the Model of the datas: replaces the funcion of acc creation in super admin
        -putted it in the user method for the auto gmail
        -in the design, created a filer
        -(Putting a search function???)
        -all function has a validation modal

front end lesson na natutunan:

how to properly build components

complete the component.ts to set the setting of that app
set the:
selector: 'app-button',
templateUrl: './app-button.component.html',
styleUrls: ['./app-button.component.scss'],
standalone: true,
imports: [CommonModule, IonButton]

this is for connecting your html and css component
app-button is your new element name <app-button> - your template

then:

export class AppButtonComponent {
@Input() label: string = 'Button';
@Input() variant: 'primary' | 'outline' = 'primary';
@Input() disabled: boolean = false;
@Input() size: 'small' | 'medium' | 'large' = 'medium';
@Output() clicked = new EventEmitter<void>();
}

the input are your scss

the label, variant, disable, size, clicked are your properties which chooses the setting

the label: string = 'Button'; - is your label

the variant: 'primary' | 'outline' = 'primary'; - you will set your scss variable here
ex.

&--primary {
--background: var(--primary);
--color: var(--primary-foreground);
}

the &-- will find it if you set it inside your = in the export which is the primary and outline

then the last part ung sa dulo ay = thats the default

next and error for http request (like try and catch in java but for internet)

Natutunan ko sa pag lilink
-Pag may HTML SCSS ka konektado un sa ts ng page nayun
-then may nakahawak rin sakanya na parent ts
-so ts pinaka main logic mo dito and then connector of the Ionic Modules,HTTP Request, Validation ETC
-so pag may gusto ka idagdag na logic sa ts ka gagawa

ORM stands for Object-Relational Mapping

ionic start my-app-name blank --type=angular-standalone
Fast Page: ionic g p pages/topic-detail --standalone
Fast Component: ionic g c components/atoms/my-button --standalone
Fast Service: ionic g s services/auth

pang create ng modal
pero need muna mag create ng component para magamit to
const modal = await this.modalCtrl.create({
component: ConfirmModalComponent,
cssClass: 'transparent-modal',
componentProps: {
title: 'Delete Account?',
message: `Are you sure you want to permanently delete <strong>${nameToDisplay}</strong>? This cannot be undone.`,
confirmText: 'Delete',
isDanger: false // Turns the modal danger colors on!
}
});

    logic of the modal creation in ts
    modalCtrl is a ionic function
    when creating it it needs the   async like | async addUser()  |
    async is needed to tell the browser that a pause will happen because of a modal
    await is the one going to cause the pause
    then the present() is for the animation
    then another await gets executed to get the data of the user


    Logic of the auth - the rxjs(rxjs is for observable tools)

    Observable tool is for API because API takes time to load

    observable is just like async but does more
    observable - handles more data
    async - handles one value

    diffrerence between observable and async

    observable uses subcribe - runs continuously and to stop we use unsubscribe
                             - if you use HTTP method there is no unsubscribe even if we use it because its automatic and we will direct it in a new route if in login system

    async uses await - it is for pausing or delaying mostly used for UI like modals

    Observable: Used for continuous, ongoing streams of time or data (like a stopwatch, live clock, or repeating interval).

    Async / Await: Used to pause execution, delay, or wait for a single result (like a 3-second delay timer or an API fetch).


        - First the creation of the class - I import the rxjs here
        - inject it and provide it in the root - so every class can use it
        - create a constructor for the add the HttpClient - to say that this class will use the api
        - create a login method for sending the frontend data to the backend to get compared

        -in the ts logic:
        - you import that auth service class
        - to use the method inside the rxjs class fill in the parameters of the function
        - that function will use the | next and error |
        - if its correct it will say next and then store the data of the database to the localStorage file
        (it needs to set it so that the website can know that the user is still login and using that account)
        -and in error it will throw in your error logic

study the urls and how the serializer and views work
