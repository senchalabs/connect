
// 
// example.c
// 
// (c) 2009 TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)
//

#ifndef __SOMETHING_H__
#define __SOMETHING_H__

typedef struct {
  unsigned int len;
  char *keys;
  char *vals;
} Array;

int 
main(int argc, char **argv) {
  printf("Hello World\n");
  return 0;
}

#endif