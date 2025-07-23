const express = require('express')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwt');
const User = require('../models/user');
const Candidate = require('../models/candidate');
// require('dotenv').config();

const checkAdminRole = async (userID) => {
    try {

        const user = await User.findById(userID);
        console.log("User fetched in checkAdminRole:",user);
        
        if (user.role === 'admin') {
            return true;
        }
    } catch (err) {
        console.log("Error in checkAdminRole:", err);
        return false;
    }
}




// POST route to add candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        console.log('Authenticated user:', req.user);

        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' });

        const data = req.body // Assuming the requst body contains the Candidate Data

        //Create a new Candidate document using the Mongoose model
        const newCandidate = new Candidate(data);
        // Save the new Candidate to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})





router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not have admin role' })

        const candidateId = req.params.candidateId; //Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Update data for the person

        const response = await candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true //Run Mongoose Validation
        })
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' })
        }
        console.log('Candidate data Updated');
        res.status(202).json(response)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})

// Delete
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not have admin role' })

        const candidateId = req.params.candidateId; //Extract the id from the URL parameter

        const response = await candidate.findByIdAndUpdate(candidateId)

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' })
        }
        console.log('Candidate data Deleted');
        res.status(202).json(response)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})

// Let's start vorting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    // no admin can vote
    // user can only vote once
    candidateId = req.params.candidateId;
    userId = req.user.id;

    try {
        // Find the Candidate document with the specifief candidateId
        const candidate = await candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' })
        }
        const user = await user.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }
        if (user.isVoter) {
            res.status(400).json({ message: 'you have alrady vorte' })
        }
        if (user.role == 'admin') {
            res.status(403).json({ message: 'admin is not allowed' })
        }
        // update the candidate document to record the vote
        candidate.votes.push({ user: userId })
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoter = true
        await user.save()
        res.status(200).json({ message: 'vote recorded succesfully' })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})

// vote count
router.get('/vote/count', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const Candidate = await candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their name and voteCount
        const voteRecord = Candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }

        })
        return res.status(200).json(voteRecord)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})

// get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and seiect only the name and party fields, excluding _id
        const candidates = await candidate.find({}, 'name part -_id')
        // Return the list of candidates
        res.status(200).json(candidates)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})

module.exports = router