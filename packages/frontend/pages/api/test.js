import { ref, object, string, boolean, positive, integer } from "yup";
const data = [
  {
    id: 1,
    firstName: "LeBron",
    middleName: "Raymone",
    lastName: "James",
    age: 36,
  },
];
export default function handler(request, response) {
  const { method } = request;

  if (method === "GET") {
    return response.status(200).json({ data });
  }

  if (method === "POST") {
    const { body } = request;
    let userSchema = object().shape({
      firstName: string().required(),
      // age: number().required(),
      //email: string().email(),
      //website: string().url().nullable(),
      //createdOn: date().default(() => new Date()),
    });

    // parse and assert validity
    userSchema.isValid({ ...body }).then(function (valid) {
      if (valid) {
        response.status(200).json({ ...body, id: 1 });
      }

      if (!valid) {
        response.status(500).json({ error: "failed to fetch data" });
      }
    });
    //data.push({ ...body, id: data.length + 1 });

    //return response.status(200).json({ ...body });
  }
}
