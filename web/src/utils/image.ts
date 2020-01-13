
export const getImageString = (e: React.ChangeEvent<HTMLInputElement>) => {

	return new Promise<string>((resolve, reject) => {
		const file = e.target.files[0]
		if (file === undefined) {
			return reject('file undefined')
		}

		const reader = new FileReader();

		reader.onloadend = () => {
			const res = reader.result as string;

			return resolve(res)
		}

		reader.readAsDataURL(file)
	})
}

export const getDownsizedImage = (imageDataUrl: string, max_size: number) => {

	return new Promise<string>((resolve, reject) => {
		const image = new Image();

		image.onload = (i) => {
			const canvas = document.createElement("canvas")
			const max_size = 544;
			let width = image.width;
			let height = image.height;
			if (width > height) {
				if (width > max_size) {
					height *= max_size / width;
					width = max_size;
				}
			}
			else {
				if (height > max_size) {
					width *= max_size / height;
					height = max_size;
				}
			}

			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').drawImage(image, 0, 0, width, height)
			const dataUrl = canvas.toDataURL('image/png')

			resolve(dataUrl)

		}

		image.src = imageDataUrl;
	})


}