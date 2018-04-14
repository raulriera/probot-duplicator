const commands = require('probot-commands')

module.exports = robot => {
  // Type `/duplicate foo, bar` in a comment box for an Issue
  commands(robot, 'duplicate', (context, command) => {
    const { issue, comment, repository } = context.payload

    // Only the creator of the issue can duplicate it
    if (issue.user.login !== comment.user.login) {
      context.log('Denied, %s is not the issue owner', comment.user.login)
      return
    }

    const issueCopy = {
      'owner': repository.owner.login,
      'repo': repository.name,
      'title': issue.title,
      'body': `${issue.body}\n\nCopy of [#${issue.number}](${issue.html_url})`,
      'milestone': issue.milestone,
      'labels': issue.labels
    }

    // GitHub API expects a value here
    if (issueCopy.milestone === null) {
      delete issueCopy.milestone
    }

    // Create a copry of the issue commented on
    context.github.issues.create(issueCopy)

    // Delete the comment that triggered this with a link to the new issue
    return context.github.issues.deleteComment({
      'owner': repository.owner.login,
      'repo': repository.name,
      'id': comment.id
    })
  })
}
