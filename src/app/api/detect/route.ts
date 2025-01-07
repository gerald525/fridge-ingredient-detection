import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
	try {
		const formData = await req.formData();

		const file = formData.get("file") as File;

		const arrayBuffer = await file.arrayBuffer();
		const base64String = Buffer.from(arrayBuffer).toString('base64');

		const gptResult = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "What are the names and counts of this ingredients? give me only answer in this JSON style: [{name:'banana',count:3},{}...]",
						},
						{
							type: "image_url",
							image_url: {
								url: `data:image/jpeg;base64,${base64String}`,
							},
						},
					],
				},
			],
		});

		const messageContent = gptResult.choices[0].message.content;

		const ingredientList = messageContent?.split("{").slice(1).map(str => JSON.parse(`{${str.split("}")[0]}}`));

		return NextResponse.json({ status: "success", result: ingredientList });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ status: "fail", error: e });
	}
}
