# What?

A JavaScript based maze solver.

# Why?

Because I can.

# How?

By analyzing the image selected from the dropdown or file browser, we can determine where the walls and paths are.
White (255, 255, 255, 255) is a path and black (0, 0, 0, 0) is a wall. The start point should be on the top or left side of the image and
it should be the only white pixel on the top or left wall. The end point should be on the bottom or right wall and should 
be the only white pixel on the bottom or right wall.
We only take pixels where you can go to two different direction or can only go back into account. The pixels on the way
are only used to calculate the distance to next node.

The maze is rendered on a canvas and scaled up by the scale amount defined in the scale input. The maze solving and
found path is rendered on a second canvas that is cleared when playing a animation or doing another solve on different method.

The pathfinding method is selected using the method dropdown and there is options animate the pathfinding as it happens
or to wait the pathfinding to finish and play the animation afterwards. Animations can be sped up and by setting the animation speed to 0 the
animation will stop and the pathfinding method will finish the solving.



# License?

MIT  
See LICENSE.md for more info