"use client";

import Image from "next/image";
import { useState, useRef, ChangeEvent } from "react";

import { ClipLoader } from "react-spinners";

type Ingredient = {
	name: string;
	count: number;
};

const placeholderImage =
	"https://via.placeholder.com/300x200?text=Upload+Image";

export default function Home() {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [detectionResult, setDetectionResult] = useState<Ingredient[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]; // Handle undefined safely
		if (file) {
			setImageFile(file);
			setSelectedImage(URL.createObjectURL(file));
		}
	};

	const handleDetectIngredients = async () => {
		if (!imageFile) return;

		setIsLoading(true);
		setDetectionResult([]);

		try {
			const formData = new FormData();
			formData.append("file", imageFile);

			const response = await fetch("/api/detect", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to detect ingredients");
			}

			const data = await response.json();
			setDetectionResult(data.result);
		} catch (error) {
			console.error(error);
			setDetectionResult([]);
		} finally {
			setIsLoading(false);
		}
	};

	const resetImage = () => {
		setSelectedImage(null);
		setImageFile(null);
		setDetectionResult([]);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
			<h1 className="text-4xl font-bold text-blue-600 mb-4">
				Fridge Detector
			</h1>

			<div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
				<div className="mb-4">
					<label className="block text-gray-700 font-semibold mb-2">
						Upload an image of your fridge
					</label>
					<input
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						ref={fileInputRef}
						disabled={!!selectedImage} // Disable input if an image is selected
						className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
					/>
				</div>

				{selectedImage && (
					<div className="mb-4">
						<p className="text-gray-700 mb-2">Selected Image:</p>
						<Image
							src={selectedImage || placeholderImage}
							alt={
								selectedImage
									? "Selected"
									: "Please upload your image"
							}
							className="w-full h-auto rounded-lg"
						/>
						{isLoading ? (
							<></>
						) : (
							<button
								onClick={resetImage}
								className="mt-2 text-red-600 hover:underline"
							>
								Remove Image
							</button>
						)}
					</div>
				)}

				<button
					onClick={handleDetectIngredients}
					className="w-full bg-blue-900 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
					disabled={!selectedImage || isLoading}
				>
					{isLoading ? (
						<ClipLoader size={20} color="#ffffff" />
					) : (
						"Detect Ingredients"
					)}
				</button>
			</div>

			{detectionResult && (
				<div className="mt-6 w-full max-w-md bg-white shadow-md rounded-lg p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-2">
						Ingredients:
					</h2>
					<ul className="list-disc list-inside text-gray-700">
						{detectionResult.map((ingredient, index) => (
							<li key={index}>
								{ingredient.name}: {ingredient.count}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
