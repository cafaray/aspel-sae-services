var options = {};

options.host = '127.0.0.1';
options.port = 3050;
options.database = '/var/lib/firebird/2.5/data/SAE80EMPRE01.FDB';
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 4096;        // default when creating database
options.pageSize = 4096;        // default when creating database
options.retryConnectionInterval = 1000; // reconnect interval in case of connection drop

module.exports=options