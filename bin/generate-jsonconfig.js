require("@fto-consult/common/bin/generate-jsonconfig")({
    projectRoot : process.cwd(),
    alias : require('../babel.config.alias')({
    })
});