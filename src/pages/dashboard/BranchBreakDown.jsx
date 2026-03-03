import React from 'react'
import { useParams } from 'react-router-dom'

const BranchBreakDown = () => {

    const { branch } = useParams();
    console.log("branch", branch)

    return (
        <div>BranchBreakDown</div>
    )
}

export default BranchBreakDown