export const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Concert Ticketing System API",
            version:"1.0.0",
            description:"API documentation for the Concert Ticketing System"
        },
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
}
