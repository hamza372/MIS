import React from 'react'

import './style.css'

type PropsType = {
	onClose: () => void
}

const FacultyProfilePictureModal: React.Factory<PropsType> = ({ onClose }) => {
	return <div className="faculty-profile-modal">
		<div className="close button red" onClick={onClose}>✕</div>
		<div className="title">Update Profile Modal</div>
	</div>
}

export default FacultyProfilePictureModal