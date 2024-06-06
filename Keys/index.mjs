export const bookKeys = [
    "ISBN",
    "yearPublished",
    "author",
    "publisher",
    "genre",
    "title",
    "nosPages",
    "id",
    "libraryId",
    "qty",
  ];

  export const libraryKeys = [
    "id", 
    "libraryName", 
    "libraryContact", 
    "email", 
    "address",
    "books",
    "libraryAdmin"
  ]

  export const librarianKeys = [
    "id",
    "role",
    "name",
    "admin",
    "email",
    "phone",
    "assignedLibrary",
    "personalEmail"
  ]
  export const keyVerifier = (request,required) =>{
    required.map((e)=>{
        if(request.indexOf(e) == -1)
            {
                throw new Error()
            }
    })
  }