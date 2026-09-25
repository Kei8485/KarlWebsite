from django.db import migrations
from django.contrib.auth.hashers import make_password


def hash_existing_codes(apps, schema_editor):
    User = apps.get_model('core', 'User')
    for user in User.objects.exclude(codePass='').iterator():
        if not user.codePass.startswith(('pbkdf2_', 'argon2', 'bcrypt', 'scrypt_')):
            user.codePass = make_password(user.codePass)
            user.save(update_fields=['codePass'])


class Migration(migrations.Migration):
    dependencies = [('core', '0007_alter_user_codepass_sessiontoken')]
    operations = [migrations.RunPython(hash_existing_codes, migrations.RunPython.noop)]
