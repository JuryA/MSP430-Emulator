#include <msp430.h>

void main (void) 
{
  WDTCTL = WDTPW|WDTHOLD;
}
