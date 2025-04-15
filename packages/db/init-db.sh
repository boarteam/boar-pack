set -e

dt=$(date '+%d/%m/%Y %H:%M:%S');
echo "$dt - Running init script the 1st time Primary PostgreSql container is created...";

adminRole=${ADMIN_ROLE_NAME:-admin}
appRole=${APP_ROLE_NAME:-app}
adminPass=${ADMIN_PASSWORD:-${adminRole}}
appPass=${APP_PASSWORD:-${appRole}}
dbName=${DB_NAME:-default}
schemaName=${SCHEMA_NAME:-${dbName}}

creating_extensions_sql=''
for extension in ${EXTENSIONS//,/ }
do
  creating_extensions_sql="${creating_extensions_sql}
  create extension ${extension} schema ${schemaName};"
done

echo "$dt - Running: psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB ...";

# add app user to admin group to set default privileges for new tables
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  create user ${adminRole} with createrole password '${adminPass}';
  create database ${dbName} with owner = '${adminRole}';

  \connect ${dbName}
  drop schema public;

  create schema ${schemaName};
  set schema '${schemaName}';
  grant all privileges on schema ${schemaName} to ${adminRole} with grant option;

  create user ${appRole} with password '${appPass}';
  grant usage on schema ${schemaName} to ${appRole};

  grant select, insert, update, delete on all tables in schema ${schemaName} to ${appRole};
  grant update on all sequences in schema ${schemaName} to ${appRole};

  alter default privileges for role ${adminRole} in schema ${schemaName}
  grant select, insert, update, delete on tables
  to ${appRole};

  alter default privileges for role ${adminRole} in schema ${schemaName}
  grant update on sequences
  to ${appRole};

  ${creating_extensions_sql}

  set search_path to ${schemaName};
EOSQL

echo "$dt - Init script is completed";
