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
      'milestone': issue.milestone ? issue.milestone.number : null,
      'labels': issue.labels
    }

    // GitHub API expects a value here
    if (issueCopy.milestone === null) {
      delete issueCopy.milestone
    }

    // Create a copy of the issue commented on
    context.github.issues.create(issueCopy)

    // Delete the comment that triggered the command
    return context.github.issues.deleteComment({
      'owner': repository.owner.login,
      'repo': repository.name,
      'id': comment.id
    })
  })
}
