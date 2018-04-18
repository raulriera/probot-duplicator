// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
// Requiring our app
const app = require('..')

function fixture (name, path) {
  return {
    event: name,
    payload: require(path)
  }
}

describe('probot-minimum-reviews', () => {
  let robot
  let github
  let payload

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)
    // Reload the payload
    payload = fixture('issue_comment', './fixtures/issue_comment.created')
    // This is an easy way to mock out the GitHub API
    github = {
      issues: {
        create: jest.fn(),
        deleteComment: jest.fn()
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('test events', () => {
    // it('when issue comment does not include command, ignore it', async () => {
    //   // Simulates delivery of a payload
    //   await robot.receive(payload)
    //
    //   expect(github.issues.create).not.toHaveBeenCalled()
    //   expect(github.issues.deleteComment).not.toHaveBeenCalled()
    // })
    //
    // it('when issue comment includes command', async () => {
    //   payload.payload.comment.body = '/duplicate'
    //   // Simulates delivery of a payload
    //   await robot.receive(payload)
    //
    //   expect(github.issues.create).toHaveBeenCalled()
    //   expect(github.issues.deleteComment).toHaveBeenCalled()
    // })
  })

  describe('test functionality', () => {
    it('when comment is from owner, duplicate it', async () => {
      payload.payload.comment.body = '/duplicate'
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.issues.create).toHaveBeenCalled()
      expect(github.issues.deleteComment).toHaveBeenCalled()
    })

    it('when the command is in any new line, it still works', async () => {
      payload.payload.comment.body = 'I got tired of duplicating everything. Bot \n/duplicate'
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.issues.create).toHaveBeenCalled()
      expect(github.issues.deleteComment).toHaveBeenCalled()
    })

    it('when issue has a milestone, it uses the number correctly', async () => {
      payload = fixture('issue_comment', './fixtures/issue_comment_with_milestone.created')
      payload.payload.comment.body = '/duplicate'
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.issues.create).toHaveBeenCalled()
      expect(github.issues.deleteComment).toHaveBeenCalled()
    })

    it('when comment is not from owner, ignore it', async () => {
      payload.payload.issue.user.login = 'paulriera'
      payload.payload.comment.body = '/duplicate'
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.issues.create).not.toHaveBeenCalled()
      expect(github.issues.deleteComment).not.toHaveBeenCalled()
    })
  })
})
