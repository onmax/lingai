export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Basic validation
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required',
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    // Here you would typically save to database
    // For now, we'll just log it to server console
    // console.log('New early access signup:', body.email)

    // Return success response
    return {
      success: true,
      message: 'Successfully registered for early access',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
