import { ref, object, string, boolean, positive, integer } from "yup";

const data = [];

export default async function handler(request, response) {
  const { method } = request;

  if (method === "GET") {
    return response.status(200).json({ data });
  }

  if (method === "POST") {
    const { body } = request;

    let userSchema = object().shape({
      firstName: string().required(),
    });

    userSchema.isValid({ ...body }).then(function (valid) {
      if (valid) {
        response.status(200).json({ ...body, id: 1 });
      }

      if (!valid) {
        response.status(500).json({ error: "failed to fetch data" });
      }
    });
  }
}
