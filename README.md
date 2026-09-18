documentation

karlWebsite_api - holds the project setting
karlWebsite-api - has the core. (models, api logic, migration)
manage.py - eto ung pinaka irurun parang sa java main class

- - - - terminal prompt for starting - - - -
        Run this to run virtual environment - venv\Scripts\activate (mag cd muna sa api folder)
        Run to run the backend server - python manage.py runserver

for installing the jdongo frame work - pip install django djangorestframework django-cors-headers

steps
1.create the backend first
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
