import React from 'react'

import { getTeamMembersInfo } from 'constants/aboutTeam'

import './style.css'

const AboutTeam = () => {

	const team_members = getTeamMembersInfo()

	return <div className="about-team section-container">
		<div className="card-container">
			{
				team_members
					.map((member, index) => <div key={index} className="card">
						<img className="avatar" src={member.avatar_url} alt={member.name} />
						<div className="title bold">{member.name}</div>
						<div className="subtitle">{member.designation}</div>
						<div className="city">{member.district || ''}</div>
					</div>)
			}
		</div >
	</div >
}

export default AboutTeam