export const getImageString = (e: React.ChangeEvent<HTMLInputElement>) => {

	return new Promise<string>((resolve, reject) => {
		const file = e.target.files[0]
		if (file === undefined) {
			return reject('file undefined')
		}

		getOrientation(file)
			.then((orientation: number) => {
				const reader = new FileReader();

				reader.onload = () => {
					const res = reader.result as string;

					resetOrientation(res, orientation)
						.then((img_string: string) => {
							return resolve(img_string)
						})
				}

				reader.readAsDataURL(file)
			})

	})
}


export const getDownsizedImage = (imageDataUrl: string, max_size: number, format: "jpeg" | "png") => {

	return new Promise<string>((resolve, reject) => {
		const image = new Image();

		image.onload = (i) => {
			const canvas = document.createElement("canvas")
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
			const dataUrl = canvas.toDataURL(`image/${format}`)

			canvas.remove()

			resolve(dataUrl)

		}

		image.src = imageDataUrl;
	})


}



function resetOrientation(srcBase64: string, srcOrientation: number) {
	return new Promise<string>((resolve, reject) => {
		var img = new Image();

		img.onload = function () {
			var width = img.width,
				height = img.height,
				canvas = document.createElement('canvas'),
				ctx = canvas.getContext("2d");

			// set proper canvas dimensions before transform & export
			if (4 < srcOrientation && srcOrientation < 9) {
				canvas.width = height;
				canvas.height = width;
			} else {
				canvas.width = width;
				canvas.height = height;
			}

			// transform context before drawing image
			switch (srcOrientation) {
				case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
				case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
				case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
				case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
				case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
				case 7: ctx.transform(0, -1, -1, 0, height, width); break;
				case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
				default: break;
			}

			// draw image
			ctx.drawImage(img, 0, 0);

			// export base64
			resolve(canvas.toDataURL());
		}

		img.src = srcBase64;

	})
}

const getOrientation = (file: File) => {

	return new Promise<number>((resolve, reject) => {
		var reader = new FileReader();

		reader.onload = (event: ProgressEvent) => {

			if (!event.target) {
				return;
			}

			const file = event.target as FileReader;
			const view = new DataView(file.result as ArrayBuffer);

			if (view.getUint16(0, false) !== 0xFFD8) {
				return resolve(-2);
			}

			const length = view.byteLength
			let offset = 2;

			while (offset < length) {
				if (view.getUint16(offset + 2, false) <= 8) return resolve(-1);
				let marker = view.getUint16(offset, false);
				offset += 2;

				if (marker === 0xFFE1) {
					if (view.getUint32(offset += 2, false) !== 0x45786966) {
						return resolve(-1);
					}

					let little = view.getUint16(offset += 6, false) === 0x4949;
					offset += view.getUint32(offset + 4, little);
					let tags = view.getUint16(offset, little);
					offset += 2;
					for (let i = 0; i < tags; i++) {
						if (view.getUint16(offset + (i * 12), little) === 0x0112) {
							return resolve(view.getUint16(offset + (i * 12) + 8, little));
						}
					}
				} else if ((marker & 0xFF00) !== 0xFF00) {
					break;
				}
				else {
					offset += view.getUint16(offset, false);
				}
			}
			return resolve(-1);
		};

		reader.readAsArrayBuffer(file);

	})
}